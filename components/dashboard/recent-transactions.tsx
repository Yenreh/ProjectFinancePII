"use client"

import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionItem } from "@/components/transactions/transaction-item"
import type { TransactionWithDetails } from "@/lib/types"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions")
        const data = await response.json()
        setTransactions(data.slice(0, 5)) // Only show 5 most recent
      } catch (error) {
        console.error("[v0] Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transacciones Recientes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transacciones">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay transacciones recientes</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
