"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import type { Account } from "@/lib/types"
import { cn } from "@/lib/utils"

export function AccountsSummary() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch("/api/accounts")
        const data = await response.json()
        setAccounts(data)
      } catch (error) {
        console.error("[v0] Error fetching accounts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumen de Cuentas</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/cuentas">
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay cuentas registradas</div>
        ) : (
          <>
            <div className="mb-6 p-4 rounded-lg bg-primary/5">
              <p className="text-sm text-muted-foreground mb-1">Balance Total</p>
              <p className={cn("text-3xl font-bold", totalBalance < 0 ? "text-destructive" : "text-foreground")}>
                {formatCurrency(totalBalance)}
              </p>
            </div>

            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{account.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
                    </div>
                  </div>
                  <p className={cn("font-semibold", account.balance < 0 ? "text-destructive" : "text-foreground")}>
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
