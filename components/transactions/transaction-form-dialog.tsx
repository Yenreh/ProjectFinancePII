"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategorySelector } from "@/components/categories/category-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction, TransactionType, Account } from "@/lib/types"
import { formatDateInput } from "@/lib/format"

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  defaultType?: TransactionType
  onSuccess?: () => void
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultType = "gasto",
  onSuccess,
}: TransactionFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [formData, setFormData] = useState({
    type: defaultType,
    account_id: "",
    category_id: 0,
    amount: "",
    description: "",
    date: formatDateInput(new Date()),
  })

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts")
        const data = await response.json()
        setAccounts(data)
        if (data.length > 0 && !formData.account_id) {
          setFormData((prev) => ({ ...prev, account_id: data[0].id.toString() }))
        }
      } catch (error) {
        console.error("[v0] Error fetching accounts:", error)
      }
    }
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        account_id: transaction.account_id.toString(),
        category_id: transaction.category_id,
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        date: transaction.date,
      })
    } else {
      setFormData({
        type: defaultType,
        account_id: accounts.length > 0 ? accounts[0].id.toString() : "",
        category_id: 0,
        amount: "",
        description: "",
        date: formatDateInput(new Date()),
      })
    }
  }, [transaction, defaultType, open, accounts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_id) {
      alert("Por favor selecciona una categoría")
      return
    }

    setLoading(true)

    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : "/api/transactions"
      const method = transaction ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al guardar transacción")

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving transaction:", error)
      alert("Error al guardar la transacción")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{transaction ? "Editar Transacción" : "Nueva Transacción"}</DialogTitle>
            <DialogDescription>
              {transaction ? "Modifica los datos de la transacción." : "Registra un nuevo ingreso o gasto."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {!transaction && (
              <Tabs
                value={formData.type}
                onValueChange={(value: string) => setFormData({ ...formData, type: value as TransactionType })}
                className="mb-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="gasto">Gasto</TabsTrigger>
                  <TabsTrigger value="ingreso">Ingreso</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <Label>Categoría</Label>
                <CategorySelector
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  type={formData.type}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="account">Cuenta</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                >
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Compra en supermercado"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : transaction ? "Guardar Cambios" : "Crear Transacción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
