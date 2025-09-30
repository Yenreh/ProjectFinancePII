import { NextResponse } from "next/server"
import { dbQueries, sql } from "@/lib/db"
import { mockTransactions, mockAccounts } from "@/lib/mock-data"
import type { DashboardMetrics } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let metrics: DashboardMetrics

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        const filters = {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
        metrics = await dbQueries.getDashboardMetrics(filters)
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        // Fallback to mock data calculation
        const totalIncome = mockTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)
        const totalExpenses = mockTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)
        const balance = totalIncome - totalExpenses
        const accountsCount = mockAccounts.length
        const transactionsCount = mockTransactions.length

        metrics = {
          totalIncome,
          totalExpenses,
          balance,
          accountsCount,
          transactionsCount,
        }
      }
    } else {
      // Mock data calculation
      const totalIncome = mockTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = mockTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)
      const balance = totalIncome - totalExpenses
      const accountsCount = mockAccounts.length
      const transactionsCount = mockTransactions.length

      metrics = {
        totalIncome,
        totalExpenses,
        balance,
        accountsCount,
        transactionsCount,
      }
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("[v0] Error fetching dashboard metrics:", error)
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 })
  }
}
