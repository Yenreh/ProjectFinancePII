"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransactionFormDialog } from "./transaction-form-dialog"
import type { TransactionType } from "@/lib/types"

interface QuickTransactionButtonsProps {
  onSuccess?: () => void
}

export function QuickTransactionButtons({ onSuccess }: QuickTransactionButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>("gasto")

  const handleOpenDialog = (type: TransactionType) => {
    setTransactionType(type)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="flex gap-3">
        <Button onClick={() => handleOpenDialog("gasto")} variant="outline" className="flex-1">
          <TrendingDown className="mr-2 h-4 w-4 text-destructive" />
          Nuevo Gasto
        </Button>
        <Button onClick={() => handleOpenDialog("ingreso")} variant="outline" className="flex-1">
          <TrendingUp className="mr-2 h-4 w-4 text-success" />
          Nuevo Ingreso
        </Button>
      </div>

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={transactionType}
        onSuccess={onSuccess}
      />
    </>
  )
}
