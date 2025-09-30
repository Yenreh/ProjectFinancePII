"use client"

import { TransactionItem } from "./transaction-item"
import type { TransactionWithDetails } from "@/lib/types"

interface TransactionListProps {
  transactions: TransactionWithDetails[]
  onEdit?: (transaction: TransactionWithDetails) => void
  onDelete?: (transaction: TransactionWithDetails) => void
  emptyMessage?: string
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  emptyMessage = "No hay transacciones para mostrar",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce(
    (groups, transaction) => {
      const date = transaction.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
      return groups
    },
    {} as Record<string, TransactionWithDetails[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, dayTransactions]) => {
        const totalIncome = dayTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)
        const totalExpense = dayTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)
        const dayBalance = totalIncome - totalExpense

        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-muted-foreground">
                {new Date(date).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <span className={`text-sm font-medium ${dayBalance >= 0 ? "text-success" : "text-destructive"}`}>
                {dayBalance >= 0 ? "+" : ""}${dayBalance.toFixed(2)}
              </span>
            </div>
            <div className="space-y-2">
              {dayTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
