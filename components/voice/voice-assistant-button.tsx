"use client"

import { useState } from "react"
import { Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VoiceAssistant } from "./voice-assistant"

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
      {/* Botón flotante */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        onClick={() => setIsOpen(true)}
      >
        <Mic className="h-6 w-6" />
        <span className="sr-only">Abrir asistente de voz</span>
      </Button>

      {/* Diálogo con el asistente */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Asistente de Voz</DialogTitle>
          <DialogDescription className="sr-only">
            Registra transacciones usando tu voz
          </DialogDescription>
          <VoiceAssistant onTransactionCreated={handleTransactionCreated} />
        </DialogContent>
      </Dialog>
    </>
  )
}
