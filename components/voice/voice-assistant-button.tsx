"use client"

import { useState } from "react"
import { Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VoiceAssistant } from "./voice-assistant"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface VoiceAssistantButtonProps {
  onTransactionCreated?: () => void
}

export function VoiceAssistantButton({ onTransactionCreated }: VoiceAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  function handleTransactionCreated() {
    onTransactionCreated?.()
    // Cerrar el diálogo después de 2 segundos
    setTimeout(() => {
      setIsOpen(false)
    }, 2000)
  }

  return (
    <>
      {/* Botón flotante - ajustado para no chocar con la barra de navegación móvil */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg z-40 hover:scale-110 transition-transform"
        onClick={() => setIsOpen(true)}
      >
        <Mic className="h-5 w-5 md:h-6 md:w-6" />
        <span className="sr-only">Abrir asistente de voz</span>
      </Button>

      {/* Diálogo con el asistente - SIN padding extra */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Asistente de Voz</DialogTitle>
          </VisuallyHidden>
          <VoiceAssistant onTransactionCreated={handleTransactionCreated} />
        </DialogContent>
      </Dialog>
    </>
  )
}
