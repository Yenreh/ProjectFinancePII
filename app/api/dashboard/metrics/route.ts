import { NextResponse } from "next/server"
import type { DashboardMetrics } from "@/lib/types"

// Mock data (in production, this would query the database)
const mockTransactions = [
  { type: "ingreso", amount: 3000.0 },
  { type: "gasto", amount: 45.5 },
  { type: "gasto", amount: 25.0 },
]

const mockAccounts = [{ balance: 500.0 }, { balance: 5000.0 }, { balance: -1200.0 }]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Calculate metrics
    const totalIncome = mockTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = mockTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    const accountsCount = mockAccounts.length

    const transactionsCount = mockTransactions.length

    const metrics: DashboardMetrics = {
      totalIncome,
      totalExpenses,
      balance,
      accountsCount,
      transactionsCount,
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[v0] Error fetching dashboard metrics:", error)
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 })
  }
}
