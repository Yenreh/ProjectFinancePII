import { NextRequest, NextResponse } from "next/server"
import {
  parseVoiceCommand,
  validateParsedCommand,
  generateConfirmationMessage,
  generateSuggestions,
  detectCorrection,
  applyCorrection,
  enrichWithDatabaseIds,
  validateBackendFormat,
} from "@/lib/nlp-service"
import { dbQueries } from "@/lib/db"
import type { VoiceProcessingResult } from "@/lib/voice-types"

export async function POST(request: NextRequest) {
  try {
    const { transcription, confirmed, parsedData, isCorrection, originalCommand, pendingCommand } = await request.json()

    if (!transcription && !confirmed) {
      return NextResponse.json(
        { error: "Se requiere transcripción o confirmación" },
        { status: 400 }
      )
    }

    // Obtener contexto de la base de datos
    const [categories, accounts] = await Promise.all([
      dbQueries.getCategories(),
      dbQueries.getAccounts(),
    ])

    // Si hay un comando pendiente (esperando información adicional como cuenta)
    if (pendingCommand && transcription) {
      console.log('[Voice] Procesando respuesta a pregunta pendiente:', transcription)
      console.log('[Voice] Comando pendiente:', pendingCommand)
      
      // Parsear la nueva entrada para extraer la cuenta o categoría (PASAR BD)
      const newParsed = parseVoiceCommand(transcription, categories, accounts)
      
      // Combinar: tomar cuenta/categoría de la nueva respuesta, resto del comando pendiente
      const combined = {
        ...pendingCommand,
        categoryName: newParsed.categoryName || pendingCommand.categoryName,
        categoryId: newParsed.categoryId || pendingCommand.categoryId,
        accountName: newParsed.accountName || pendingCommand.accountName,
        accountId: newParsed.accountId || pendingCommand.accountId,
        originalText: `${pendingCommand.originalText} + ${transcription}`,
      }
      
      // Enriquecer con IDs de la base de datos
      const enriched = enrichWithDatabaseIds(combined, categories, accounts)
      const backendValidation = validateBackendFormat(enriched)
      
      console.log('[Voice] Comando combinado:', enriched)
      console.log('[Voice] Validación backend:', backendValidation)
      
      if (backendValidation.valid) {
        const confirmationMessage = generateConfirmationMessage(enriched)
        
        const result: VoiceProcessingResult = {
          success: true,
          message: confirmationMessage,
          parsedCommand: enriched,
          needsConfirmation: true,
        }
        
        return NextResponse.json(result)
      } else {
        // Aún falta información
        const result: VoiceProcessingResult = {
          success: false,
          message: `Todavía falta información: ${backendValidation.errors.join(", ")}`,
          parsedCommand: enriched,
          needsConfirmation: false,
          needsAdditionalInfo: true,  // Aún esperando más información
          suggestions: generateSuggestions(enriched, categories, accounts),
        }
        
        return NextResponse.json(result)
      }
    }

    // Si es una corrección, aplicarla al comando original
    if (isCorrection && originalCommand && transcription) {
      const correction = detectCorrection(transcription, categories, accounts)
      
      if (correction.isCorrection) {
        const corrected = applyCorrection(originalCommand, correction)
        const enriched = enrichWithDatabaseIds(corrected, categories, accounts)
        const backendValidation = validateBackendFormat(enriched)
        
        if (backendValidation.valid) {
          const confirmationMessage = generateConfirmationMessage(enriched)
          
          const result: VoiceProcessingResult = {
            success: true,
            message: `Corrección aplicada. ${confirmationMessage}`,
            parsedCommand: enriched,
            needsConfirmation: true,
          }
          
          return NextResponse.json(result)
        } else {
          const result: VoiceProcessingResult = {
            success: false,
            message: `Corrección incompleta. ${backendValidation.errors.join(", ")}`,
            parsedCommand: enriched,
            needsConfirmation: false,
            suggestions: generateSuggestions(enriched, categories, accounts),
          }
          
          return NextResponse.json(result)
        }
      }
    }

    // Si es una confirmación, procesar la transacción directamente
    if (confirmed && parsedData) {
      return await processConfirmedTransaction(parsedData)
    }

    // Analizar el comando de voz (PASAR CATEGORÍAS Y CUENTAS DE LA BD)
    let parsed = parseVoiceCommand(transcription, categories, accounts)
    
    // Si es una consulta, procesarla directamente
    if (parsed.intention === "consulta") {
      return await processQuery(parsed)
    }
    
    // Enriquecer con IDs de la base de datos (para transacciones)
    parsed = enrichWithDatabaseIds(parsed, categories, accounts)
    
    const validation = validateParsedCommand(parsed)
    const backendValidation = validateBackendFormat(parsed)

    // NUEVO: Si hay múltiples cuentas y no se especificó cuál, preguntar (mantener contexto)
    if (parsed.transactionType && !parsed.accountId && accounts.length > 1) {
      const accountsList = accounts.map(a => a.name).join(", ")
      const result: VoiceProcessingResult = {
        success: false,
        message: `Tienes ${accounts.length} cuentas: ${accountsList}. ¿En cuál cuenta quieres registrar esta transacción?`,
        parsedCommand: parsed,  // Guardar el comando actual
        needsConfirmation: false,
        needsAdditionalInfo: true,  // Bandera para indicar que espera más info
        suggestions: accounts.map(a => `en ${a.name.toLowerCase()}`),
      }
      return NextResponse.json(result)
    }

    // Si el comando es válido para el backend, generar confirmación
    if (validation.valid && backendValidation.valid && parsed.transactionType && parsed.amount) {
      const confirmationMessage = generateConfirmationMessage(parsed)

      const result: VoiceProcessingResult = {
        success: true,
        message: confirmationMessage,
        parsedCommand: parsed,
        needsConfirmation: true,
      }

      return NextResponse.json(result)
    }

    // Si falta información, solicitar más datos
    const suggestions = generateSuggestions(parsed, categories, accounts)
    const allErrors = [...validation.missingFields, ...backendValidation.errors]

    // Crear mensaje de error más específico
    let errorMessage = "Me falta información. "
    if (validation.missingFields.includes("categoría")) {
      errorMessage = "No identifiqué la categoría. "
    } else if (validation.missingFields.includes("monto")) {
      errorMessage = "No entendí el monto. "
    } else if (validation.missingFields.includes("tipo de transacción")) {
      errorMessage = "No sé si es ingreso o gasto. "
    }

    const result: VoiceProcessingResult = {
      success: false,
      message: errorMessage,
      parsedCommand: parsed,
      needsConfirmation: false,
      suggestions,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error procesando comando de voz:", error)
    return NextResponse.json(
      { error: "Error al procesar el comando" },
      { status: 500 }
    )
  }
}

/**
 * Procesa consultas de voz (última transacción, total del día, etc.)
 */
async function processQuery(parsed: any) {
  try {
    const queryType = parsed.queryType || "general"

    switch (queryType) {
      case "ultimo_gasto": {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/voice/last-transaction?type=gasto`,
          { cache: "no-store" }
        )
        const data = await response.json()

        if (!data.success || !data.transaction) {
          const result: VoiceProcessingResult = {
            success: true,
            message: "No tienes ningún gasto registrado aún",
            parsedCommand: parsed,
            needsConfirmation: false,
          }
          return NextResponse.json(result)
        }

        const t = data.transaction
        const result: VoiceProcessingResult = {
          success: true,
          message: `Tu último gasto fue de $${t.amount.toLocaleString("es-CO")} pesos en ${t.categoryName}. ${t.description}`,
          parsedCommand: parsed,
          needsConfirmation: false,
        }
        return NextResponse.json(result)
      }

      case "ultimo_ingreso": {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/voice/last-transaction?type=ingreso`,
          { cache: "no-store" }
        )
        const data = await response.json()

        if (!data.success || !data.transaction) {
          const result: VoiceProcessingResult = {
            success: true,
            message: "No tienes ningún ingreso registrado aún",
            parsedCommand: parsed,
            needsConfirmation: false,
          }
          return NextResponse.json(result)
        }

        const t = data.transaction
        const result: VoiceProcessingResult = {
          success: true,
          message: `Tu último ingreso fue de $${t.amount.toLocaleString("es-CO")} pesos en ${t.categoryName}. ${t.description}`,
          parsedCommand: parsed,
          needsConfirmation: false,
        }
        return NextResponse.json(result)
      }

      case "total_hoy": {
        const text = parsed.originalText.toLowerCase()
        const isGasto = text.includes("gast") || text.includes("egres")
        const isIngreso = text.includes("ingres") || text.includes("recib")

        let typeParam = ""
        if (isGasto && !isIngreso) {
          typeParam = "?type=gasto"
        } else if (isIngreso && !isGasto) {
          typeParam = "?type=ingreso"
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/voice/today-total${typeParam}`,
          { cache: "no-store" }
        )
        const data = await response.json()

        if (!data.success) {
          const result: VoiceProcessingResult = {
            success: true,
            message: "Aún no tienes transacciones hoy",
            parsedCommand: parsed,
            needsConfirmation: false,
          }
          return NextResponse.json(result)
        }

        const typeText = data.data.type === "gasto" ? "gastado" : data.data.type === "ingreso" ? "recibido" : "movido"
        const message = data.data.total > 0
          ? `Hoy has ${typeText} $${data.data.total.toLocaleString("es-CO")} pesos en ${data.data.count} ${data.data.count === 1 ? "transacción" : "transacciones"}`
          : "Aún no tienes transacciones hoy"

        const result: VoiceProcessingResult = {
          success: true,
          message,
          parsedCommand: parsed,
          needsConfirmation: false,
        }
        return NextResponse.json(result)
      }

      case "balance": {
        // Obtener todas las cuentas con sus balances
        const accounts = await dbQueries.getAccounts()

        if (accounts.length === 0) {
          const result: VoiceProcessingResult = {
            success: true,
            message: "No tienes cuentas registradas aún",
            parsedCommand: parsed,
            needsConfirmation: false,
          }
          return NextResponse.json(result)
        }

        // Calcular balance total
        const totalBalance = accounts.reduce((sum, account) => {
          return sum + Number(account.balance)
        }, 0)

        // Generar mensaje con detalle por cuenta
        let message = `Tu balance total es de $${totalBalance.toLocaleString("es-CO")} pesos. `
        
        if (accounts.length === 1) {
          message += `En tu cuenta ${accounts[0].name}.`
        } else {
          message += "Distribuido en: "
          const accountDetails = accounts.map(acc => 
            `${acc.name} con $${Number(acc.balance).toLocaleString("es-CO")}`
          ).join(", ")
          message += accountDetails
        }

        const result: VoiceProcessingResult = {
          success: true,
          message,
          parsedCommand: parsed,
          needsConfirmation: false,
        }
        return NextResponse.json(result)
      }

      default: {
        const result: VoiceProcessingResult = {
          success: false,
          message: "No entendí tu consulta. Puedes preguntar por tu último gasto, último ingreso, cuánto gastaste hoy o cuál es tu balance",
          parsedCommand: parsed,
          needsConfirmation: false,
        }
        return NextResponse.json(result)
      }
    }
  } catch (error) {
    console.error("Error procesando consulta:", error)
    const result: VoiceProcessingResult = {
      success: false,
      message: "Ocurrió un error al procesar tu consulta",
      parsedCommand: parsed,
      needsConfirmation: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
    return NextResponse.json(result)
  }
}

async function processConfirmedTransaction(parsedData: any) {
  try {
    // Validar que tengamos los IDs necesarios
    if (!parsedData.categoryId || !parsedData.accountId) {
      // Intentar obtener los IDs si solo tenemos nombres
      const [categories, accounts] = await Promise.all([
        dbQueries.getCategories(parsedData.transactionType),
        dbQueries.getAccounts(),
      ])

      if (!parsedData.categoryId && parsedData.categoryName) {
        const category = categories.find(
          (c) => c.name.toLowerCase() === parsedData.categoryName?.toLowerCase()
        )
        if (category) {
          parsedData.categoryId = category.id
        }
      }

      if (!parsedData.accountId && parsedData.accountName) {
        const account = accounts.find(
          (a) => a.name.toLowerCase() === parsedData.accountName?.toLowerCase()
        )
        if (account) {
          parsedData.accountId = account.id
        }
      }

      // Si aún no hay cuenta, usar la primera disponible
      if (!parsedData.accountId && accounts.length > 0) {
        parsedData.accountId = accounts[0].id
      }
    }

    if (!parsedData.categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró la categoría "${parsedData.categoryName}"`,
          needsConfirmation: false,
          error: "Categoría no encontrada",
        } as VoiceProcessingResult,
        { status: 404 }
      )
    }

    if (!parsedData.accountId) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay cuentas disponibles. Por favor crea una cuenta primero.",
          needsConfirmation: false,
          error: "No hay cuentas disponibles",
        } as VoiceProcessingResult,
        { status: 404 }
      )
    }

    // Obtener la cuenta para actualizar balance
    const accounts = await dbQueries.getAccounts()
    const account = accounts.find(a => a.id === parsedData.accountId)

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "Cuenta no encontrada",
          needsConfirmation: false,
          error: "Cuenta no válida",
        } as VoiceProcessingResult,
        { status: 404 }
      )
    }

    // HU-009: Verificar duplicados en ventana de 1 minuto
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const recentTransactions = await dbQueries.getTransactions({
      accountId: parsedData.accountId,
      startDate: oneMinuteAgo.toISOString().split("T")[0],
    })

    const isDuplicate = recentTransactions.some(
      (t) =>
        t.amount === parsedData.amount &&
        t.category_id === parsedData.categoryId &&
        t.type === parsedData.transactionType &&
        Math.abs(new Date(t.date).getTime() - now.getTime()) < 60000
    )

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "Ya registraste una transacción similar hace menos de un minuto. ¿Estás seguro de que no es un duplicado?",
          needsConfirmation: false,
          error: "Posible transacción duplicada",
        } as VoiceProcessingResult,
        { status: 409 }
      )
    }

    // Crear la transacción
    const transaction = await dbQueries.createTransaction({
      account_id: parsedData.accountId,
      category_id: parsedData.categoryId,
      type: parsedData.transactionType,
      amount: parsedData.amount,
      description: parsedData.description || "Transacción por voz",
      date: new Date().toISOString().split("T")[0],
    })

    console.log(`[Voice] Transacción creada: ID=${transaction.id}, Tipo=${parsedData.transactionType}, Monto=${parsedData.amount}, Cuenta=${parsedData.accountId}`)

    // Actualizar el balance de la cuenta
    const oldBalance = Number(account.balance) || 0  // Convertir a número por si viene como string
    const amount = Number(parsedData.amount) || 0
    
    const newBalance =
      parsedData.transactionType === "ingreso"
        ? oldBalance + amount
        : oldBalance - amount

    console.log(`[Voice] Actualizando balance: Cuenta=${parsedData.accountId} (${account.name}), Balance anterior=${oldBalance} (${typeof account.balance}), Monto=${amount}, Nuevo balance=${newBalance}`)

    try {
      const updatedAccount = await dbQueries.updateAccount(parsedData.accountId, { balance: newBalance })
      console.log(`[Voice] Balance actualizado exitosamente. Balance en DB: ${updatedAccount.balance}`)
    } catch (error) {
      console.error(`[Voice] ERROR actualizando balance:`, error)
      throw error
    }

    // Mensaje de confirmación detallado
    const typeText = parsedData.transactionType === "ingreso" ? "Ingreso" : "Gasto"
    const amountText = parsedData.amount.toLocaleString("es-CO")
    const categoryText = parsedData.categoryName || "sin categoría"
    const accountText = parsedData.accountName || account.name
    
    const result: VoiceProcessingResult = {
      success: true,
      message: `¡Listo! Tu ${typeText.toLowerCase()} de $${amountText} pesos en ${categoryText} fue guardado en la cuenta ${accountText}. El nuevo balance es $${newBalance.toLocaleString("es-CO")} pesos.`,
      transactionId: transaction.id,
      needsConfirmation: false,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error creando transacción:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear la transacción",
        needsConfirmation: false,
        error: "Error interno del servidor",
      } as VoiceProcessingResult,
      { status: 500 }
    )
  }
}
