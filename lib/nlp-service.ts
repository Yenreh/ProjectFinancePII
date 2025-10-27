import {
  ParsedVoiceCommand,
  VoiceIntention,
  ConfidenceLevel,
  IntentionKeywords,
  CorrectionCommand,
  QueryType,
  NavigationType,
  ControlType,
} from "./voice-types"
import { TransactionType, Category, Account } from "./types"

/**
 * Palabras clave para detectar intenciones
 */
const INTENTION_KEYWORDS: IntentionKeywords = {
  ingreso: [
    "recibí",
    "recibo",
    "gané",
    "me dieron",
    "me pagaron",
    "ingresó",
    "ingreso",
    "cobré",
    "cobro",
    "entrada",
    "deposito",
    "transferencia a favor",
    "me entró",
    "me entraron",
    "me llegó",
    "me depositaron",
  ],
  gasto: [
    "gasté",
    "gasto",
    "compré",
    "compro",
    "pagué",
    "pago",
    "salida",
    "egreso",
    "di",
    "entregué",
    "consumí",
    "invertí",
    "me gasté",
    "se me fue",
    "se me fueron",
    "salió",
    "salieron",
  ],
  consulta: [
    "cuánto",
    "cuanto",
    "balance",
    "saldo",
    "total",
    "resumen",
    "estado",
    "consulta",
    "último",
    "ultima",
    "cual fue",
    "cuál fue",
    "hoy",
  ],
}

/**
 * Palabras clave para navegación (HU-011)
 */
const NAVIGATION_KEYWORDS: Record<NavigationType, string[]> = {
  cuentas: ["cuentas", "cuenta", "ir a cuentas", "abrir cuentas", "mostrar cuentas"],
  transacciones: ["transacciones", "transacción", "ir a transacciones", "abrir transacciones", "historial"],
  reportes: ["reportes", "reporte", "ir a reportes", "abrir reportes", "estadísticas", "gráficas"],
  inicio: ["inicio", "home", "principal", "volver", "ir al inicio"],
}

/**
 * Palabras clave para control (HU-010)
 */
const CONTROL_KEYWORDS: Record<ControlType, string[]> = {
  activar_continuo: ["activar asistente", "hola asistente", "hey finanzas", "modo continuo", "escucha continua"],
  desactivar_continuo: ["desactivar asistente", "detener escucha", "apagar", "desactivar", "salir"],
  cancelar: ["cancelar", "cancela", "olvídalo", "no importa"],
}

/**
 * Palabras clave para detectar correcciones
 */
const CORRECTION_KEYWORDS = [
  "no",
  "error",
  "mal",
  "incorrecto",
  "cambia",
  "cambiar",
  "corrige",
  "corregir",
  "era",
  "eran",
  "quise decir",
  "quiero decir",
]

/**
 * Categorías comunes y sus variaciones
 */
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  Alimentación: [
    "comida",
    "almuerzo",
    "desayuno",
    "cena",
    "hamburguesa",
    "pizza",
    "restaurante",
    "mercado",
    "supermercado",
    "alimentos",
    "alimentación",
    "bebidas",
  ],
  Transporte: [
    "transporte",
    "taxi",
    "uber",
    "bus",
    "gasolina",
    "combustible",
    "parqueadero",
    "peaje",
  ],
  Vivienda: [
    "vivienda",
    "arriendo",
    "alquiler",
    "renta",
    "casa",
    "apartamento",
  ],
  Servicios: [
    "servicios",
    "luz",
    "agua",
    "internet",
    "teléfono",
    "celular",
    "netflix",
    "spotify",
  ],
  Entretenimiento: [
    "entretenimiento",
    "cine",
    "teatro",
    "concierto",
    "juegos",
    "diversión",
  ],
  Salud: ["salud", "medicina", "doctor", "hospital", "farmacia", "medicamentos"],
  Educación: ["educación", "curso", "libro", "universidad", "colegio", "estudio"],
  Compras: ["compras", "compra", "compré", "ropa", "zapatos", "tienda"],
  Salario: ["salario", "sueldo", "pago", "nómina", "quincena"],
  Freelance: ["freelance", "trabajo independiente", "proyecto"],
  Inversiones: ["inversiones", "inversión", "dividendos", "rendimiento"],
  Ventas: ["venta", "vendí", "vendo"],
  "Otros Gastos": ["otro", "varios", "misceláneos", "otro gasto"],
  "Otros Ingresos": ["otro ingreso", "otros ingresos", "otro"],
}

/**
 * Nombres de cuentas comunes
 */
const ACCOUNT_MAPPINGS: Record<string, string[]> = {
  Efectivo: ["efectivo", "cash", "plata"],
  Banco: ["banco", "cuenta", "ahorros"],
  Tarjeta: ["tarjeta", "crédito", "débito"],
}

/**
 * Extrae el monto de una transcripción
 */
function extractAmount(text: string): number | undefined {
  // Normalizar el texto
  const normalizedText = text.toLowerCase()

  // Patrones para detectar montos
  const patterns = [
    // Números con separadores: "50.000" o "50,000" o "50 000"
    /(\d{1,3}(?:[.,\s]\d{3})+(?:[.,]\d{2})?)\s*(?:pesos?|cop|$|dólares?|usd)?/i,
    // Números sin separadores: "50000" o "1500000"
    /(\d{4,})\s*(?:pesos?|cop|$|dólares?|usd)?/i,
    // "cincuenta mil" o "50 mil"
    /(\d+)\s*(?:mil|millones?|k|m)/i,
  ]

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern)
    if (match) {
      // Remover puntos, comas y espacios del número capturado
      let amount = match[1].replace(/[.,\s]/g, "")
      
      // Convertir palabras a números
      if (normalizedText.includes("mil")) {
        const baseNumber = parseInt(amount)
        amount = (baseNumber * 1000).toString()
      }
      
      const parsedAmount = parseInt(amount)
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        return parsedAmount
      }
    }
  }

  return undefined
}

/**
 * Detecta la intención del comando
 */
function detectIntention(text: string): VoiceIntention {
  const normalizedText = text.toLowerCase()

  // Verificar palabras clave de control primero (HU-010)
  for (const keywords of Object.values(CONTROL_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return "control"
    }
  }

  // Verificar palabras clave de navegación (HU-011)
  for (const keywords of Object.values(NAVIGATION_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return "navegacion"
    }
  }

  // Verificar palabras clave de consulta
  if (INTENTION_KEYWORDS.consulta.some((keyword) => normalizedText.includes(keyword))) {
    return "consulta"
  }

  // Verificar palabras clave de ingreso
  if (INTENTION_KEYWORDS.ingreso.some((keyword) => normalizedText.includes(keyword))) {
    return "ingreso"
  }

  // Verificar palabras clave de gasto
  if (INTENTION_KEYWORDS.gasto.some((keyword) => normalizedText.includes(keyword))) {
    return "gasto"
  }

  return "desconocido"
}

/**
 * Detecta el tipo de consulta específico
 */
function detectQueryType(text: string): QueryType {
  const normalizedText = text.toLowerCase()

  // Último gasto
  if (
    (normalizedText.includes("último") || normalizedText.includes("ultima")) &&
    (normalizedText.includes("gasto") || normalizedText.includes("gasté"))
  ) {
    return "ultimo_gasto"
  }

  // Último ingreso
  if (
    (normalizedText.includes("último") || normalizedText.includes("ultima")) &&
    (normalizedText.includes("ingreso") || normalizedText.includes("recibí"))
  ) {
    return "ultimo_ingreso"
  }

  // Total de hoy
  if (
    normalizedText.includes("hoy") &&
    (normalizedText.includes("total") ||
      normalizedText.includes("cuánto") ||
      normalizedText.includes("cuanto"))
  ) {
    return "total_hoy"
  }

  // Balance/saldo
  if (normalizedText.includes("balance") || normalizedText.includes("saldo")) {
    return "balance"
  }

  return "general"
}

/**
 * Detecta el tipo de navegación específico (HU-011)
 */
function detectNavigationType(text: string): NavigationType {
  const normalizedText = text.toLowerCase()

  for (const [type, keywords] of Object.entries(NAVIGATION_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return type as NavigationType
    }
  }

  return "inicio"
}

/**
 * Detecta el tipo de control específico (HU-010)
 */
function detectControlType(text: string): ControlType {
  const normalizedText = text.toLowerCase()

  for (const [type, keywords] of Object.entries(CONTROL_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return type as ControlType
    }
  }

  return "cancelar"
}

/**
 * Extrae la categoría del texto
 */
function extractCategory(text: string): string | undefined {
  const normalizedText = text.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return category
    }
  }

  return undefined
}

/**
 * Extrae el nombre de la cuenta
 */
function extractAccount(text: string): string | undefined {
  const normalizedText = text.toLowerCase()

  for (const [account, keywords] of Object.entries(ACCOUNT_MAPPINGS)) {
    if (keywords.some((keyword) => normalizedText.includes(keyword))) {
      return account
    }
  }

  return undefined
}

/**
 * Extrae la descripción del comando
 */
function extractDescription(text: string, amount?: number, category?: string): string {
  let description = text

  // Remover palabras clave de intención
  Object.values(INTENTION_KEYWORDS)
    .flat()
    .forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      description = description.replace(regex, "")
    })

  // Remover el monto
  if (amount) {
    const amountPatterns = [
      new RegExp(`\\b${amount}\\b`, "g"),
      new RegExp(`\\b${amount.toLocaleString()}\\b`, "g"),
      /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:pesos?|cop|$|dólares?|usd)?/gi,
    ]
    amountPatterns.forEach((pattern) => {
      description = description.replace(pattern, "")
    })
  }

  // Remover palabras de categoría
  if (category && CATEGORY_MAPPINGS[category]) {
    CATEGORY_MAPPINGS[category].forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      description = description.replace(regex, "")
    })
  }

  // Limpiar espacios extras
  description = description.replace(/\s+/g, " ").trim()

  // Si la descripción quedó vacía, usar el texto original resumido
  if (!description && category) {
    description = `Transacción de ${category}`
  }

  return description || "Transacción por voz"
}

/**
 * Calcula el nivel de confianza del análisis
 */
function calculateConfidence(parsed: Partial<ParsedVoiceCommand>): ConfidenceLevel {
  let score = 0

  // Intención detectada: +2
  if (parsed.intention && parsed.intention !== "desconocido") {
    score += 2
  }

  // Monto detectado: +2
  if (parsed.amount && parsed.amount > 0) {
    score += 2
  }

  // Categoría detectada: +1
  if (parsed.categoryName) {
    score += 1
  }

  // Total: 0-5
  if (score >= 4) return "alta"
  if (score >= 2) return "media"
  return "baja"
}

/**
 * Analiza un comando de voz y extrae la información relevante
 */
export function parseVoiceCommand(transcription: string): ParsedVoiceCommand {
  const intention = detectIntention(transcription)
  const amount = extractAmount(transcription)
  const categoryName = extractCategory(transcription)
  const accountName = extractAccount(transcription)
  const description = extractDescription(transcription, amount, categoryName)

  const parsed: ParsedVoiceCommand = {
    intention,
    transactionType: intention === "ingreso" || intention === "gasto" ? intention : undefined,
    amount,
    categoryName,
    accountName,
    description,
    originalText: transcription,
    confidence: "baja", // Se calculará después
  }

  // Si es una consulta, detectar el tipo específico
  if (intention === "consulta") {
    parsed.queryType = detectQueryType(transcription)
  }

  // Si es navegación, detectar el tipo específico (HU-011)
  if (intention === "navegacion") {
    parsed.navigationType = detectNavigationType(transcription)
  }

  // Si es control, detectar el tipo específico (HU-010)
  if (intention === "control") {
    parsed.controlType = detectControlType(transcription)
  }

  parsed.confidence = calculateConfidence(parsed)

  return parsed
}

/**
 * Valida si un comando parseado tiene suficiente información
 */
export function validateParsedCommand(
  parsed: ParsedVoiceCommand
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = []

  if (!parsed.transactionType) {
    missingFields.push("tipo de transacción")
  }

  if (!parsed.amount || parsed.amount <= 0) {
    missingFields.push("monto")
  }

  if (!parsed.categoryName) {
    missingFields.push("categoría")
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * Genera un mensaje de confirmación para el usuario
 */
export function generateConfirmationMessage(parsed: ParsedVoiceCommand): string {
  const { transactionType, amount, categoryName, description } = parsed

  if (!transactionType || !amount) {
    return "No pude entender completamente tu comando. ¿Podrías repetirlo?"
  }

  const amountFormatted = amount.toLocaleString("es-CO")
  const action = transactionType === "ingreso" ? "registrar un ingreso" : "registrar un gasto"

  let message = `Voy a ${action} de $${amountFormatted} pesos`

  if (categoryName) {
    message += ` en la categoría ${categoryName}`
  }

  if (description && description !== "Transacción por voz") {
    message += ` con la descripción: "${description}"`
  }

  message += ". ¿Es correcto?"

  return message
}

/**
 * Genera sugerencias cuando falta información (HU-013: Mejorado)
 */
export function generateSuggestions(parsed: ParsedVoiceCommand): string[] {
  const suggestions: string[] = []
  const validation = validateParsedCommand(parsed)

  if (!validation.valid) {
    // HU-013: Mensajes más específicos y contextuales
    if (validation.missingFields.includes("monto")) {
      suggestions.push("No entendí el monto. Di algo como: 'gasté 50000 pesos' o 'recibí 100000'")
    }

    if (validation.missingFields.includes("categoría")) {
      suggestions.push(
        "No identifiqué la categoría. Intenta con: 'en alimentos', 'en transporte', 'en servicios', o 'de salario'"
      )
    }

    if (validation.missingFields.includes("tipo de transacción")) {
      suggestions.push(
        "No sé si es ingreso o gasto. Di 'gasté' para gastos o 'recibí' para ingresos"
      )
    }
  }

  // HU-013: Sugerencias adicionales si el comando es ambiguo
  if (parsed.confidence === "baja") {
    suggestions.push("Intenta hablar más claro y mencionar el monto y la categoría")
  }

  return suggestions
}

/**
 * Detecta si el comando es una corrección
 */
export function detectCorrection(text: string): CorrectionCommand {
  const normalizedText = text.toLowerCase()
  
  const isCorrection = CORRECTION_KEYWORDS.some((keyword) => 
    normalizedText.includes(keyword)
  )

  if (!isCorrection) {
    return {
      isCorrection: false,
      originalText: text,
    }
  }

  // Detectar qué campo se está corrigiendo
  let field: CorrectionCommand["field"]
  let newValue: string | number | undefined

  // Corrección de monto
  const amount = extractAmount(text)
  if (amount) {
    field = "amount"
    newValue = amount
  }
  
  // Corrección de categoría
  const category = extractCategory(text)
  if (category && !field) {
    field = "category"
    newValue = category
  }

  // Corrección de tipo (ingreso/gasto)
  const intention = detectIntention(text)
  if ((intention === "ingreso" || intention === "gasto") && !field) {
    field = "type"
    newValue = intention
  }

  return {
    isCorrection: true,
    field,
    newValue,
    originalText: text,
  }
}

/**
 * Aplica una corrección a un comando previamente parseado
 */
export function applyCorrection(
  original: ParsedVoiceCommand,
  correction: CorrectionCommand
): ParsedVoiceCommand {
  const updated = { ...original }

  if (!correction.isCorrection || !correction.field) {
    return updated
  }

  switch (correction.field) {
    case "amount":
      if (typeof correction.newValue === "number") {
        updated.amount = correction.newValue
      }
      break

    case "category":
      if (typeof correction.newValue === "string") {
        updated.categoryName = correction.newValue
      }
      break

    case "type":
      if (correction.newValue === "ingreso" || correction.newValue === "gasto") {
        updated.transactionType = correction.newValue
        updated.intention = correction.newValue
      }
      break

    case "description":
      if (typeof correction.newValue === "string") {
        updated.description = correction.newValue
      }
      break

    case "account":
      if (typeof correction.newValue === "string") {
        updated.accountName = correction.newValue
      }
      break
  }

  // Recalcular confianza después de la corrección
  updated.confidence = calculateConfidence(updated)
  updated.originalText = correction.originalText

  return updated
}

/**
 * Enriquece el comando parseado con IDs de categoría y cuenta desde la base de datos
 * HU-014: Integración con categorías existentes
 */
export function enrichWithDatabaseIds(
  parsed: ParsedVoiceCommand,
  categories: Category[],
  accounts: Account[]
): ParsedVoiceCommand {
  const enriched = { ...parsed }

  // HU-014: Buscar ID de categoría con mapeo inteligente
  if (enriched.categoryName && !enriched.categoryId) {
    // Primero intentar match exacto
    let category = categories.find(
      (c) => c.name.toLowerCase() === enriched.categoryName?.toLowerCase()
    )
    
    // Si no hay match exacto, buscar en las keywords del CATEGORY_MAPPINGS
    if (!category) {
      for (const [categoryKey, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
        if (keywords.some(k => k.toLowerCase() === enriched.categoryName?.toLowerCase())) {
          category = categories.find(c => c.name === categoryKey)
          break
        }
      }
    }
    
    if (category) {
      enriched.categoryId = category.id
      enriched.categoryName = category.name // Usar nombre exacto de la BD
    }
  }

  // Buscar ID de cuenta
  if (enriched.accountName && !enriched.accountId) {
    const account = accounts.find(
      (a) => a.name.toLowerCase() === enriched.accountName?.toLowerCase()
    )
    if (account) {
      enriched.accountId = account.id
      enriched.accountName = account.name // Usar nombre exacto de la BD
    }
  }

  // Si no hay cuenta especificada, usar la primera disponible
  if (!enriched.accountId && accounts.length > 0) {
    enriched.accountId = accounts[0].id
    enriched.accountName = accounts[0].name
  }

  return enriched
}

/**
 * Valida que el comando tenga formato válido para el backend
 */
export function validateBackendFormat(parsed: ParsedVoiceCommand): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!parsed.transactionType) {
    errors.push("Falta el tipo de transacción (ingreso/gasto)")
  }

  if (!parsed.amount || parsed.amount <= 0) {
    errors.push("Falta el monto o es inválido")
  }

  if (!parsed.categoryId) {
    errors.push("Falta el ID de la categoría")
  }

  if (!parsed.accountId) {
    errors.push("Falta el ID de la cuenta")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

