"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog"
import { QuickTransactionButtons } from "@/components/transactions/quick-transaction-buttons"
import { TransactionFilters, type FilterValues } from "@/components/transactions/transaction-filters"
import { VoiceAssistantButton } from "@/components/voice/voice-assistant-button"
import type { TransactionWithDetails } from "@/lib/types"

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.accountId) params.append("accountId", filters.accountId.toString())
      if (filters.categoryId) params.append("categoryId", filters.categoryId.toString())
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error("[v0] Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const handleEdit = (transaction: TransactionWithDetails) => {
    setSelectedTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDelete = async (transaction: TransactionWithDetails) => {
    if (!confirm(`¿Estás seguro de eliminar esta transacción?`)) return

    try {
      await fetch(`/api/transactions/${transaction.id}`, { method: "DELETE" })
      fetchTransactions()
    } catch (error) {
      console.error("[v0] Error deleting transaction:", error)
    }
  }

  const handleNewTransaction = () => {
    setSelectedTransaction(null)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-balance">Transacciones</h1>
              <p className="text-muted-foreground mt-1">Historial de ingresos y gastos</p>
            </div>
            <Button onClick={handleNewTransaction} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              Nueva
            </Button>
          </div>

          <div className="mb-6">
            <QuickTransactionButtons onSuccess={fetchTransactions} />
          </div>

          <div className="mb-6">
            <TransactionFilters onFilterChange={setFilters} />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando transacciones...</div>
          ) : (
            <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>
      </main>

      <MobileNav />

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTransaction}
        onSuccess={fetchTransactions}
      />

      {/* Asistente de voz flotante */}
      <VoiceAssistantButton onTransactionCreated={fetchTransactions} />
    </div>
  )
}
