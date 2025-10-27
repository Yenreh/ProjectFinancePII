import { NextResponse } from "next/server"
import { dbQueries, sql } from "@/lib/db"
import { mockTransactions, createMockTransactionsWithDetails } from "@/lib/mock-data"
import type { Transaction, TransactionWithDetails } from "@/lib/types"
import { validateNumber, calculateNewBalance, formatBalanceForLog } from "@/lib/balance-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const accountId = searchParams.get("accountId")
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let transactionsWithDetails: TransactionWithDetails[] = []

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        const filters = {
          type: (type === "ingreso" || type === "gasto") ? type as "ingreso" | "gasto" : undefined,
          accountId: accountId ? Number.parseInt(accountId) : undefined,
          categoryId: categoryId ? Number.parseInt(categoryId) : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
        transactionsWithDetails = await dbQueries.getTransactions(filters)
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        transactionsWithDetails = createMockTransactionsWithDetails()
      }
    } else {
      // Use mock data and apply manual filtering
      transactionsWithDetails = createMockTransactionsWithDetails()
      
      // Apply filters
      if (type && (type === "ingreso" || type === "gasto")) {
        transactionsWithDetails = transactionsWithDetails.filter((t) => t.type === type)
      }
      if (accountId) {
        transactionsWithDetails = transactionsWithDetails.filter((t) => t.account_id === Number.parseInt(accountId))
      }
      if (categoryId) {
        transactionsWithDetails = transactionsWithDetails.filter((t) => t.category_id === Number.parseInt(categoryId))
      }
      if (startDate) {
        transactionsWithDetails = transactionsWithDetails.filter((t) => t.date >= startDate)
      }
      if (endDate) {
        transactionsWithDetails = transactionsWithDetails.filter((t) => t.date <= endDate)
      }
    }

    // Sort by date descending (database should already do this, but ensure consistency)
    transactionsWithDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(transactionsWithDetails)
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { account_id, category_id, type, amount, description, date } = body

    console.log("[Transaction POST] 📝 Received data:", { account_id, category_id, type, amount, date })

    // Validation
    if (!account_id || !category_id || !type || !amount || !date) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    if (type !== "ingreso" && type !== "gasto") {
      return NextResponse.json({ error: "Tipo de transacción inválido" }, { status: 400 })
    }

    // Convertir y validar datos usando utilidades
    const accountIdNum = validateNumber(account_id, "ID de cuenta")
    const categoryIdNum = validateNumber(category_id, "ID de categoría")
    const amountNum = validateNumber(amount, "Monto")

    if (accountIdNum <= 0) {
      return NextResponse.json({ error: "ID de cuenta debe ser mayor a 0" }, { status: 400 })
    }

    if (categoryIdNum <= 0) {
      return NextResponse.json({ error: "ID de categoría debe ser mayor a 0" }, { status: 400 })
    }

    if (amountNum <= 0) {
      return NextResponse.json({ error: "Monto debe ser mayor a 0" }, { status: 400 })
    }

    const newTransactionData = {
      account_id: accountIdNum,
      category_id: categoryIdNum,
      type,
      amount: amountNum,
      description: description || null,
      date,
    }

    console.log("[Transaction POST] ✅ Validated data:", newTransactionData)

    let newTransaction: Transaction

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        // Obtener la cuenta para calcular el nuevo balance
        const accounts = await dbQueries.getAccounts(true)
        const account = accounts.find(a => a.id === newTransactionData.account_id)
        
        if (!account) {
          return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
        }

        console.log("[Transaction POST] 💰 Account balance before:", formatBalanceForLog(account.balance))
        
        // Crear la transacción
        newTransaction = await dbQueries.createTransaction(newTransactionData)
        
        // Calcular el nuevo balance usando utilidades
        const newBalance = calculateNewBalance(
          account.balance,
          newTransactionData.amount,
          newTransactionData.type
        )

        console.log("[Transaction POST] ⚖️  New balance after:", formatBalanceForLog(newBalance))
        
        // Actualizar el balance de la cuenta
        await dbQueries.updateAccount(newTransactionData.account_id, { balance: newBalance })
        console.log("[Transaction POST] ✅ Updated account balance to:", formatBalanceForLog(newBalance))
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        // Fallback to mock data creation
        newTransaction = {
          ...newTransactionData,
          id: Math.max(...mockTransactions.map((t) => t.id), 0) + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockTransactions.push(newTransaction)
      }
    } else {
      // Mock data creation
      newTransaction = {
        ...newTransactionData,
        id: Math.max(...mockTransactions.map((t) => t.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockTransactions.push(newTransaction)
    }

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating transaction:", error)
    return NextResponse.json({ error: "Error al crear transacción" }, { status: 500 })
  }
}
