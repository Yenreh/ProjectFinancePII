import { TransactionType } from "./types"

/**
 * Tipos de intención detectados por el asistente de voz
 */
export type VoiceIntention = "ingreso" | "gasto" | "consulta" | "navegacion" | "control" | "desconocido"

/**
 * Subtipo de consulta
 */
export type QueryType = "ultimo_gasto" | "ultimo_ingreso" | "total_hoy" | "balance" | "general"

/**
 * Subtipo de navegación
 */
export type NavigationType = "cuentas" | "transacciones" | "reportes" | "inicio"

/**
 * Subtipo de control
 */
export type ControlType = "activar_continuo" | "desactivar_continuo" | "cancelar"

/**
 * Estado de confianza en la transcripción
 */
export type ConfidenceLevel = "alta" | "media" | "baja"

/**
 * Datos extraídos de un comando de voz
 */
export interface ParsedVoiceCommand {
  intention: VoiceIntention
  transactionType?: TransactionType
  amount?: number
  categoryName?: string
  categoryId?: number
  description?: string
  accountName?: string
  accountId?: number
  confidence: ConfidenceLevel
  originalText: string
  queryType?: QueryType
  navigationType?: NavigationType
  controlType?: ControlType
}

/**
 * Comando de corrección detectado
 */
export interface CorrectionCommand {
  isCorrection: boolean
  field?: "amount" | "category" | "description" | "account" | "type"
  newValue?: string | number
  originalText: string
}

/**
 * Respuesta del procesamiento de voz
 */
export interface VoiceProcessingResult {
  success: boolean
  message: string
  parsedCommand?: ParsedVoiceCommand
  transactionId?: number
  needsConfirmation: boolean
  needsAdditionalInfo?: boolean  // Indica que el comando está incompleto y espera más información
  suggestions?: string[]
  error?: string
}

/**
 * Estado de la grabación de audio
 */
export type RecordingState = "idle" | "recording" | "processing" | "error"

/**
 * Configuración para ElevenLabs
 */
export interface ElevenLabsConfig {
  apiKey: string
  modelId?: string
  voiceId?: string
}

/**
 * Respuesta del servicio de transcripción
 */
export interface TranscriptionResponse {
  text: string
  confidence: number
  duration: number
}

/**
 * Palabras clave para detectar intenciones
 */
export interface IntentionKeywords {
  ingreso: string[]
  gasto: string[]
  consulta: string[]
}
