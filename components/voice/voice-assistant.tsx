"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Loader2, Check, X, Volume2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useVoiceRecorder } from "@/lib/hooks/use-voice-recorder"
import type { VoiceProcessingResult, ParsedVoiceCommand } from "@/lib/voice-types"

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
  const [isContinuousMode, setIsContinuousMode] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

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
      
      // Si estamos en modo corrección, incluir el comando original
      if (isInCorrectionMode && originalCommand) {
        payload.isCorrection = true
        payload.originalCommand = originalCommand
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
      setProcessingResult(result)

      // Guardar el comando parseado para posibles correcciones
      if (result.parsedCommand) {
        setOriginalCommand(result.parsedCommand)
      }

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

      // HU-013: Si hubo error, reproducir sugerencias por voz
      if (!result.success && result.suggestions && result.suggestions.length > 0) {
        const suggestionsText = result.suggestions.join(". ")
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
      await speakMessage("Lo siento, ocurrió un error al procesar tu comando")
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
      setIsSpeaking(true)

      const response = await fetch("/api/voice/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      })

      if (!response.ok) {
        console.error("Error al sintetizar voz")
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

      await audioRef.current.play()

    } catch (err) {
      console.error("Error reproduciendo audio:", err)
      setIsSpeaking(false)
    }
  }

  async function handleConfirm() {
    if (!processingResult?.parsedCommand) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/voice/process-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed: true,
          parsedData: processingResult.parsedCommand,
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
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      toast.error("Error al crear transacción", {
        description: errorMessage,
      })
      await speakMessage("Lo siento, ocurrió un error al crear la transacción")
    } finally {
      setIsProcessing(false)
    }
  }

  function handleCorrection() {
    setIsInCorrectionMode(true)
    setProcessingResult(null)
    toast.info("Modo corrección activado", {
      description: "Di tu corrección, por ejemplo: 'no, era 15000'",
    })
  }

  function handleCancel() {
    setProcessingResult(null)
    setError(null)
    setIsInCorrectionMode(false)
    setOriginalCommand(null)
    cancelRecording()
  }

  function handleStartNew() {
    setProcessingResult(null)
    setError(null)
    setIsInCorrectionMode(false)
    setOriginalCommand(null)
  }

  // HU-010: Manejar comandos de control (modo manos libres)
  async function handleControlCommand(controlType?: string, message?: string) {
    if (controlType === "activar_continuo") {
      setIsContinuousMode(true)
      await speakMessage("Modo manos libres activado. Estoy escuchando continuamente.")
      toast.success("Modo manos libres activado", {
        description: "El asistente seguirá escuchando después de cada comando",
      })
      // Reiniciar grabación automáticamente
      setTimeout(() => startRecording(), 1500)
    } else if (controlType === "desactivar_continuo") {
      setIsContinuousMode(false)
      await speakMessage("Modo manos libres desactivado.")
      toast.info("Modo manos libres desactivado")
      cancelRecording()
    } else if (controlType === "cancelar") {
      handleCancel()
      await speakMessage("Operación cancelada")
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

    const route = navigationType ? routes[navigationType] : "/"
    
    if (route) {
      await speakMessage(`Navegando a ${navigationType || "inicio"}`)
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
  const showConfirmation = processingResult?.needsConfirmation
  const showSuccess = processingResult?.success && processingResult.transactionId

  return (
    <Card
      className="w-full max-w-2xl mx-auto"
      role="region"
      aria-label="Asistente de voz para finanzas personales"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Asistente de Voz
          {isContinuousMode && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              Modo Manos Libres
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" aria-live="polite">
        {/* Botones de control */}
        <div className="flex flex-col items-center gap-4">
          {showRecordButton && (
            <Button
              size="lg"
              variant="default"
              className="h-24 w-24 rounded-full"
              onClick={startRecording}
              aria-label="Iniciar grabación de voz"
            >
              <Mic className="h-8 w-8" />
            </Button>
          )}

          {showStopButton && (
            <Button
              size="lg"
              variant="destructive"
              className="h-24 w-24 rounded-full animate-pulse"
              onClick={stopRecording}
            >
              <MicOff className="h-8 w-8" />
            </Button>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Procesando...</span>
            </div>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-2 text-blue-500">
              <Volume2 className="h-6 w-6 animate-pulse" />
              <span>Reproduciendo respuesta...</span>
            </div>
          )}
        </div>

        {/* Transcripción */}
        {transcription && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Escuché:</p>
            <p className="text-sm italic">&quot;{transcription}&quot;</p>
          </div>
        )}

        {/* Resultado del procesamiento */}
        {processingResult && (
          <div className="space-y-3">
            {/* Comando parseado */}
            {processingResult.parsedCommand && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Información detectada:</p>
                <div className="text-sm space-y-1">
                  {processingResult.parsedCommand.transactionType && (
                    <p>
                      <span className="font-medium">Tipo:</span>{" "}
                      {processingResult.parsedCommand.transactionType === "ingreso"
                        ? "Ingreso"
                        : "Gasto"}
                    </p>
                  )}
                  {processingResult.parsedCommand.amount && (
                    <p>
                      <span className="font-medium">Monto:</span> $
                      {processingResult.parsedCommand.amount.toLocaleString("es-CO")}
                    </p>
                  )}
                  {processingResult.parsedCommand.categoryName && (
                    <p>
                      <span className="font-medium">Categoría:</span>{" "}
                      {processingResult.parsedCommand.categoryName}
                    </p>
                  )}
                  {processingResult.parsedCommand.description && (
                    <p>
                      <span className="font-medium">Descripción:</span>{" "}
                      {processingResult.parsedCommand.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje */}
            <div
              className={`p-4 rounded-lg ${
                processingResult.success ? "bg-green-50 text-green-900" : "bg-yellow-50 text-yellow-900"
              }`}
            >
              <p className="text-sm">{processingResult.message}</p>
            </div>

            {/* Sugerencias */}
            {processingResult.suggestions && processingResult.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 text-blue-900 rounded-lg">
                <p className="text-sm font-medium mb-2">Sugerencias:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  {processingResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 text-red-900 rounded-lg">
            <p className="text-sm font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        {showConfirmation && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={isProcessing || isSpeaking}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCorrection}
                disabled={isProcessing || isSpeaking}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Corregir
              </Button>
            </div>
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
          <Button className="w-full" onClick={handleStartNew}>
            Hacer otra transacción
          </Button>
        )}

        {/* HU-013: Botón para repetir comando en caso de error */}
        {!showConfirmation && !showSuccess && processingResult && !processingResult.success && (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleStartNew}>
              Intentar de nuevo
            </Button>
            <Button variant="outline" className="flex-1" onClick={startRecording}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Repetir
            </Button>
          </div>
        )}

        {/* HU-012: Comandos sugeridos en pantalla inicial */}
        {!transcription && !processingResult && !isInCorrectionMode && (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-3 font-medium">Comandos que puedes usar:</p>
            </div>
            
            {/* Gastos */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Registrar gastos:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_COMMANDS.gastos.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-3 py-1.5 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Ingresos */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Registrar ingresos:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_COMMANDS.ingresos.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-3 py-1.5 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Consultas */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Hacer consultas:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_COMMANDS.consultas.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    &quot;{cmd}&quot;
                  </button>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Navegar:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_COMMANDS.navegacion.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedCommand(cmd)}
                    className="px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
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
      </CardContent>
    </Card>
  )
}
