"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Loader2, Check, X, Volume2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useVoiceRecorder } from "@/lib/hooks/use-voice-recorder"
import type { VoiceProcessingResult, ParsedVoiceCommand } from "@/lib/voice-types"
import type { Account, Category } from "@/lib/types"

// HU-012: Comandos sugeridos
const SUGGESTED_COMMANDS = {
  gastos: [
    "gasté 50000 en comida",
    "pagué 30000 en transporte",
    "compré 120000 en ropa",
  ],
  ingresos: [
    "recibí 200000 por freelance",
    "me entró 1500000 de salario",
    "cobré 80000 por venta",
  ],
  consultas: [
    "¿cuál fue mi último gasto?",
    "¿cuánto gasté hoy?",
    "¿cuál es mi balance?",
  ],
  navegacion: [
    "ir a cuentas",
    "abrir transacciones",
    "mostrar reportes",
  ],
  control: [
    "activar asistente",
    "desactivar asistente",
  ],
}

interface VoiceAssistantProps {
  onTransactionCreated?: () => void
}

export function VoiceAssistant({ onTransactionCreated }: VoiceAssistantProps) {
  const router = useRouter()
  const [processingResult, setProcessingResult] = useState<VoiceProcessingResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInCorrectionMode, setIsInCorrectionMode] = useState(false)
  const [originalCommand, setOriginalCommand] = useState<ParsedVoiceCommand | null>(null)
  const [pendingCommand, setPendingCommand] = useState<ParsedVoiceCommand | null>(null)
  const [isContinuousMode, setIsContinuousMode] = useState(false)
  
  // Estados para edición inline
  const [editedType, setEditedType] = useState<string>("")
  const [editedAmount, setEditedAmount] = useState<string>("")
  const [editedCategory, setEditedCategory] = useState<string>("")
  const [editedAccount, setEditedAccount] = useState<string>("")
  const [editedDescription, setEditedDescription] = useState<string>("")
  const [hasManualEdits, setHasManualEdits] = useState(false)

  // Datos de categorías y cuentas
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pendingCommandRef = useRef<ParsedVoiceCommand | null>(null)
  
  // Sincronizar ref con state
  useEffect(() => {
    pendingCommandRef.current = pendingCommand
  }, [pendingCommand])

  // Cargar categorías y cuentas
  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, accountsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/accounts"),
        ])
        const categoriesData = await categoriesRes.json()
        const accountsData = await accountsRes.json()
        setCategories(categoriesData)
        setAccounts(accountsData)
      } catch (error) {
        console.error("Error cargando categorías/cuentas:", error)
      }
    }
    fetchData()
  }, [])

  const {
    recordingState,
    transcription,
    isListening,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder({
    onTranscriptionComplete: handleTranscriptionComplete,
    onError: handleRecordingError,
  })

  // HU-011: Atajos de teclado accesibles
  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // Ctrl+Shift+V para activar grabación
      if (event.ctrlKey && event.shiftKey && event.key === "V") {
        event.preventDefault()
        if (!isListening) {
          startRecording()
        }
      }
      // Escape para cancelar
      if (event.key === "Escape") {
        if (isListening || processingResult) {
          handleCancel()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isListening, processingResult])

  async function handleTranscriptionComplete(text: string) {
    setIsProcessing(true)
    setError(null)

    try {
      const payload: any = { transcription: text }
      
      console.log('[Voice UI] ===== INICIO DE PROCESAMIENTO =====')
      console.log('[Voice UI] Transcripción:', text)
      console.log('[Voice UI] Comando pendiente actual (state):', pendingCommand)
      console.log('[Voice UI] Comando pendiente actual (ref):', pendingCommandRef.current)
      console.log('[Voice UI] Comando original actual:', originalCommand)
      
      // USAR EL REF en lugar del state para obtener el valor más reciente
      if (pendingCommandRef.current) {
        payload.pendingCommand = pendingCommandRef.current
        console.log('[Voice UI] ➡️ Enviando respuesta con contexto pendiente:', pendingCommandRef.current)
      }
      
      // Si estamos en modo corrección, incluir el comando original
      else if (isInCorrectionMode && originalCommand) {
        payload.isCorrection = true
        payload.originalCommand = originalCommand
        console.log('[Voice UI] ➡️ Enviando corrección con comando original:', originalCommand)
      }

      const response = await fetch("/api/voice/process-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Error al procesar el comando")
      }

      const result: VoiceProcessingResult = await response.json()
      console.log('[Voice UI] ⬅️ Respuesta recibida:', {
        success: result.success,
        needsConfirmation: result.needsConfirmation,
        needsAdditionalInfo: result.needsAdditionalInfo,
        message: result.message,
        parsedCommand: result.parsedCommand
      })
      setProcessingResult(result)

      // Si el resultado indica que necesita información adicional, guardar como pendiente
      if (result.needsAdditionalInfo && result.parsedCommand) {
        setPendingCommand(result.parsedCommand)
        pendingCommandRef.current = result.parsedCommand  // Actualizar ref inmediatamente
        console.log('[Voice UI] 💾 Guardando comando como pendiente (falta info):', result.parsedCommand)
      } 
      // Si la transacción fue exitosa o se está pidiendo confirmación, limpiar pendiente
      else if (result.success || result.needsConfirmation) {
        setPendingCommand(null)
        pendingCommandRef.current = null  // Limpiar ref también
        console.log('[Voice UI] 🧹 Limpiando comando pendiente')
      }

      // Guardar el comando parseado para posibles correcciones
      if (result.parsedCommand) {
        setOriginalCommand(result.parsedCommand)
        // Inicializar campos editables
        setEditedType(result.parsedCommand.transactionType || "")
        setEditedAmount(result.parsedCommand.amount?.toString() || "")
        setEditedCategory(result.parsedCommand.categoryName || "")
        setEditedAccount(result.parsedCommand.accountName || "")
        setEditedDescription(result.parsedCommand.description || "")
        setHasManualEdits(false) // Resetear flag de edición manual
      }
      
      console.log('[Voice UI] ===== FIN DE PROCESAMIENTO =====')
      console.log('')

      // HU-010: Manejar comandos de control
      if (result.parsedCommand?.intention === "control") {
        handleControlCommand(result.parsedCommand.controlType, result.message)
        setIsProcessing(false)
        return
      }

      // HU-011: Manejar comandos de navegación
      if (result.parsedCommand?.intention === "navegacion") {
        handleNavigationCommand(result.parsedCommand.navigationType, result.message)
        setIsProcessing(false)
        return
      }

      // Para consultas, reproducir la respuesta directamente sin pedir confirmación
      if (result.parsedCommand?.intention === "consulta") {
        if (result.message) {
          await speakMessage(result.message)
        }
        
        // Mostrar toast con la información
        toast.info("Consulta procesada", {
          description: result.message,
          duration: 6000,
        })

        // Limpiar después de un tiempo
        setTimeout(() => {
          setProcessingResult(null)
          // HU-010: Si está en modo continuo, reiniciar grabación
          if (isContinuousMode) {
            setTimeout(() => startRecording(), 1000)
          }
        }, 6000)

        setIsProcessing(false)
        return
      }

      // Reproducir respuesta de voz para transacciones
      if (result.message) {
        await speakMessage(result.message)
      }

      // HU-013: Si hubo error Y hay sugerencias, reproducir SOLO las 2 primeras de forma concisa
      if (!result.success && result.suggestions && result.suggestions.length > 0) {
        // Tomar solo las 2 primeras sugerencias para ser conciso
        const topSuggestions = result.suggestions.slice(0, 2)
        const suggestionsText = topSuggestions.join(", o ")
        await speakMessage(suggestionsText)
      }

      // Si estábamos en modo corrección y fue exitosa, salir del modo
      if (isInCorrectionMode && result.success) {
        setIsInCorrectionMode(false)
      }

      // HU-010: Si está en modo continuo, reiniciar grabación después de procesar
      if (isContinuousMode && result.success && result.transactionId) {
        setTimeout(() => {
          setProcessingResult(null)
          startRecording()
        }, 3000)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      toast.error("Error al procesar comando", {
        description: errorMessage,
      })
      await speakMessage("Error al procesar comando")
    } finally {
      setIsProcessing(false)
    }
  }

  function handleRecordingError(err: Error) {
    setError(err.message)
    setIsProcessing(false)
  }

  async function speakMessage(message: string) {
    try {
      // Detener cualquier audio anterior antes de reproducir uno nuevo
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      
      setIsSpeaking(true)

      const response = await fetch("/api/voice/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      })

      if (!response.ok) {
        console.error("Error al sintetizar voz")
        setIsSpeaking(false)
        return
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Reproducir el audio
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      audioRef.current.src = audioUrl
      audioRef.current.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      // Manejar errores de reproducción
      audioRef.current.onerror = () => {
        console.error("Error al reproducir audio")
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audioRef.current.play()

    } catch (err) {
      console.error("Error reproduciendo audio:", err)
      setIsSpeaking(false)
    }
  }
  
  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      // Limpiar la URL del blob si existe
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src)
        audioRef.current.src = ''
      }
      setIsSpeaking(false)
    }
  }

  async function handleConfirm() {
    if (!processingResult?.parsedCommand) return

    setIsProcessing(true)
    setError(null)

    try {
      // Aplicar valores editados al comando antes de confirmar
      const updatedCommand = {
        ...processingResult.parsedCommand,
        transactionType: editedType || processingResult.parsedCommand.transactionType,
        amount: editedAmount ? parseFloat(editedAmount) : processingResult.parsedCommand.amount,
        categoryName: editedCategory || processingResult.parsedCommand.categoryName,
        accountName: editedAccount || processingResult.parsedCommand.accountName,
        description: editedDescription || processingResult.parsedCommand.description,
      }

      const response = await fetch("/api/voice/process-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed: true,
          parsedData: updatedCommand,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la transacción")
      }

      const result: VoiceProcessingResult = await response.json()
      setProcessingResult(result)

      // Reproducir mensaje de confirmación
      if (result.message) {
        await speakMessage(result.message)
      }

      // Notificar que se creó una transacción
      if (result.success && result.transactionId) {
        toast.success("Transacción creada", {
          description: result.message,
          duration: 5000,
        })
        onTransactionCreated?.()
        
        // Limpiar el comando pendiente después de confirmar exitosamente
        setPendingCommand(null)
        pendingCommandRef.current = null
        setOriginalCommand(null)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      toast.error("Error al crear transacción", {
        description: errorMessage,
      })
      await speakMessage("Error al crear transacción")
    } finally {
      setIsProcessing(false)
    }
  }

  function handleCancel() {
    setProcessingResult(null)
    setError(null)
    setIsInCorrectionMode(false)
    setOriginalCommand(null)
    setPendingCommand(null)
    pendingCommandRef.current = null  // Limpiar ref también
    setHasManualEdits(false)
    stopAudio()
    cancelRecording()
  }

  function handleStartNew() {
    setProcessingResult(null)
    setError(null)
    setIsInCorrectionMode(false)
    setOriginalCommand(null)
    stopAudio()
    // NO limpiar pendingCommand aquí - se limpia solo cuando se completa o cancela
  }
  
  function handleCancelAll() {
    // Esta función limpia TODO, incluyendo pendingCommand
    setProcessingResult(null)
    setError(null)
    setIsInCorrectionMode(false)
    setOriginalCommand(null)
    setPendingCommand(null)
    pendingCommandRef.current = null  // Limpiar ref también
    setHasManualEdits(false)
    stopAudio()
  }

  // Verificar si los campos tienen la información mínima necesaria
  function hasMinimumRequiredData(): boolean {
    return !!(editedType && editedAmount && parseFloat(editedAmount) > 0 && editedCategory && editedAccount)
  }

  // HU-010: Manejar comandos de control (modo manos libres)
  async function handleControlCommand(controlType?: string, message?: string) {
    if (controlType === "activar_continuo") {
      setIsContinuousMode(true)
      await speakMessage("Modo continuo activado")
      toast.success("Modo manos libres activado", {
        description: "El asistente seguirá escuchando después de cada comando",
      })
      // Reiniciar grabación automáticamente
      setTimeout(() => startRecording(), 1500)
    } else if (controlType === "desactivar_continuo") {
      setIsContinuousMode(false)
      await speakMessage("Modo continuo desactivado")
      toast.info("Modo manos libres desactivado")
      cancelRecording()
    } else if (controlType === "cancelar") {
      handleCancel()
      await speakMessage("Cancelado")
    }
  }

  // HU-011: Manejar comandos de navegación
  async function handleNavigationCommand(navigationType?: string, message?: string) {
    const routes: Record<string, string> = {
      cuentas: "/cuentas",
      transacciones: "/transacciones",
      reportes: "/reportes",
      inicio: "/",
    }

    const navigationMessages: Record<string, string> = {
      cuentas: "Abriendo la sección de cuentas",
      transacciones: "Abriendo el historial de transacciones",
      reportes: "Abriendo los reportes financieros",
      inicio: "Regresando a la página principal",
    }

    const route = navigationType ? routes[navigationType] : "/"
    const voiceMessage = navigationType ? navigationMessages[navigationType] : navigationMessages.inicio
    
    if (route) {
      await speakMessage(voiceMessage)
      toast.info(`Navegando a ${navigationType || "inicio"}`)
      router.push(route)
    }
  }

  // HU-012: Manejar clic en comando sugerido
  async function handleSuggestedCommand(command: string) {
    // Simular que el usuario dijo el comando
    await handleTranscriptionComplete(command)
  }

  const showRecordButton = recordingState === "idle" && !processingResult?.transactionId
  const showStopButton = isListening
  const showConfirmation = processingResult?.needsConfirmation || (hasManualEdits && hasMinimumRequiredData())
  const showSuccess = processingResult?.success && processingResult.transactionId

  return (
    <div
      className="w-full"
      role="region"
      aria-label="Asistente de voz para finanzas personales"
    >
      {/* Header del modal */}
      <div className="px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Asistente de Voz</h2>
          {isContinuousMode && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              Modo Manos Libres
            </span>
          )}
        </div>
      </div>

      {/* Contenido del modal */}
      <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto" aria-live="polite">
        {/* Botones de control - Altura fija para evitar saltos */}
        <div className="flex flex-col items-center gap-4 min-h-[100px] justify-center">
          {showRecordButton && (
            <Button
              size="lg"
              variant="default"
              className="h-20 w-20 rounded-full transition-all"
              onClick={startRecording}
              aria-label="Iniciar grabación de voz"
            >
              <Mic className="h-7 w-7" />
            </Button>
          )}

          {showStopButton && (
            <Button
              size="lg"
              variant="destructive"
              className="h-20 w-20 rounded-full animate-pulse transition-all"
              onClick={stopRecording}
            >
              <MicOff className="h-7 w-7" />
            </Button>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 transition-opacity">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Procesando...</span>
            </div>
          )}

          {isSpeaking && (
            <div className="flex flex-col items-center gap-3 transition-opacity">
              <div className="flex items-center gap-2 text-blue-500">
                <Volume2 className="h-6 w-6 animate-pulse" />
                <span>Reproduciendo respuesta...</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={stopAudio}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Detener audio
              </Button>
            </div>
          )}
        </div>

        {/* Transcripción - Con transición suave */}
        {transcription && (
          <div className="p-4 bg-muted rounded-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-medium mb-1">Escuché:</p>
            <p className="text-sm italic">&quot;{transcription}&quot;</p>
          </div>
        )}

        {/* Información detectada - Editable - SOLO PARA TRANSACCIONES (gasto/ingreso) */}
        {processingResult?.parsedCommand && (processingResult.parsedCommand.intention === "gasto" || processingResult.parsedCommand.intention === "ingreso") && (
          <div className="p-6 bg-background border rounded-lg space-y-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-base font-semibold">Información detectada</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo - Siempre mostrar si hay resultado */}
              <div className="grid gap-2">
                <Label htmlFor="type-edit">Tipo</Label>
                <Select
                  value={editedType}
                  onValueChange={(value) => {
                    setEditedType(value)
                    setHasManualEdits(true)
                  }}
                >
                  <SelectTrigger id="type-edit">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasto">Gasto</SelectItem>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Monto - Siempre mostrar si hay resultado */}
              <div className="grid gap-2">
                <Label htmlFor="amount-edit">Monto</Label>
                <Input
                  id="amount-edit"
                  type="number"
                  step="0.01"
                  value={editedAmount}
                  onChange={(e) => {
                    setEditedAmount(e.target.value)
                    setHasManualEdits(true)
                  }}
                  placeholder="0.00"
                />
              </div>
              
              {/* Categoría - Siempre mostrar si hay resultado */}
              <div className="grid gap-2">
                <Label htmlFor="category-edit">Categoría</Label>
                <Select
                  value={editedCategory}
                  onValueChange={(value) => {
                    setEditedCategory(value)
                    setHasManualEdits(true)
                  }}
                >
                  <SelectTrigger id="category-edit">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => !editedType || cat.type === editedType)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Cuenta - Siempre mostrar si hay resultado */}
              <div className="grid gap-2">
                <Label htmlFor="account-edit">Cuenta</Label>
                <Select
                  value={editedAccount}
                  onValueChange={(value) => {
                    setEditedAccount(value)
                    setHasManualEdits(true)
                  }}
                >
                  <SelectTrigger id="account-edit">
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Descripción - Siempre mostrar si hay resultado */}
            <div className="grid gap-2">
              <Label htmlFor="description-edit">Descripción (opcional)</Label>
              <Textarea
                id="description-edit"
                value={editedDescription}
                onChange={(e) => {
                  setEditedDescription(e.target.value)
                  setHasManualEdits(true)
                }}
                placeholder="Ej: Compra en supermercado"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Mensaje de estado - Área fija para evitar saltos */}
        {processingResult && (
          <div className="min-h-[60px] transition-all">
            <div
              className={`p-4 rounded-lg transition-all animate-in fade-in duration-300 ${
                processingResult.success 
                  ? "bg-green-50 text-green-900 border-l-4 border-green-500" 
                  : processingResult.needsAdditionalInfo
                  ? "bg-blue-50 text-blue-900 border-l-4 border-blue-500"
                  : "bg-yellow-50 text-yellow-900 border-l-4 border-yellow-500"
              }`}
            >
              <p className="text-sm font-medium">{processingResult.message}</p>
            </div>
          </div>
        )}

        {/* Sugerencias - Solo mostrar si hay */}
        {processingResult?.suggestions && processingResult.suggestions.length > 0 && (
          <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border-l-4 border-blue-400 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-sm font-medium mb-2">Puedes decir:</p>
            <div className="flex flex-wrap gap-2">
              {processingResult.suggestions.map((suggestion, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                >
                  &quot;{suggestion}&quot;
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 text-red-900 rounded-lg border-l-4 border-red-500 transition-all animate-in fade-in duration-300">
            <p className="text-sm font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Botones de acción - Área fija para evitar saltos */}
        <div className="min-h-[48px] transition-all">
          {showConfirmation && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Button
                className="w-full"
                onClick={handleConfirm}
                disabled={isProcessing || isSpeaking}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar Transacción
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleCancel}
                disabled={isProcessing || isSpeaking}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}

          {showSuccess && (
            <Button 
              className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300" 
              onClick={handleStartNew}
            >
              Hacer otra transacción
            </Button>
          )}

          {/* Botones para cuando hay error o falta información */}
          {!showConfirmation && !showSuccess && processingResult && !processingResult.success && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Button className="flex-1" onClick={handleStartNew}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCancelAll}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* HU-012: Comandos sugeridos en pantalla inicial */}
        {!transcription && !processingResult && !isInCorrectionMode && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Comandos que puedes usar</h3>
              <p className="text-sm text-muted-foreground">Presiona el micrófono y di uno de estos comandos</p>
            </div>
            
            {/* Gastos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-sm font-semibold">-</span>
                </div>
                <h4 className="text-sm font-semibold text-red-900">Registrar gastos</h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-10">
                {SUGGESTED_COMMANDS.gastos.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Ingresos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-sm font-semibold">+</span>
                </div>
                <h4 className="text-sm font-semibold text-green-900">Registrar ingresos</h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-10">
                {SUGGESTED_COMMANDS.ingresos.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Consultas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">?</span>
                </div>
                <h4 className="text-sm font-semibold text-blue-900">Hacer consultas</h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-10">
                {SUGGESTED_COMMANDS.consultas.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-semibold">→</span>
                </div>
                <h4 className="text-sm font-semibold text-purple-900">Navegar</h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-10">
                {SUGGESTED_COMMANDS.navegacion.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modo corrección */}
        {isInCorrectionMode && !transcription && (
          <div className="text-center p-4 bg-blue-50 text-blue-900 rounded-lg">
            <p className="font-medium mb-2">Modo Corrección Activado</p>
            <p className="text-sm mb-2">Di tu corrección, por ejemplo:</p>
            <ul className="text-sm space-y-1">
              <li>&quot;No, era 15000&quot;</li>
              <li>&quot;Cambia a Alimentos&quot;</li>
              <li>&quot;En realidad fue un ingreso&quot;</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
