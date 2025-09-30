import { NextResponse } from "next/server"
import type { CategoryExpense } from "@/lib/types"

// Mock data
const mockTransactions = [
  { category_id: 6, type: "gasto", amount: 45.5 },
  { category_id: 10, type: "gasto", amount: 25.0 },
  { category_id: 6, type: "gasto", amount: 120.0 },
  { category_id: 7, type: "gasto", amount: 80.0 },
]

const mockCategories = [
  { id: 6, name: "Alimentación", icon: "UtensilsCrossed", color: "hsl(25, 70%, 50%)" },
  { id: 7, name: "Transporte", icon: "Car", color: "hsl(200, 70%, 50%)" },
  { id: 10, name: "Entretenimiento", icon: "Film", color: "hsl(330, 70%, 55%)" },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Filter expenses only
    const expenses = mockTransactions.filter((t) => t.type === "gasto")

    // Group by category
    const categoryTotals = expenses.reduce(
      (acc, transaction) => {
        const categoryId = transaction.category_id
        if (!acc[categoryId]) {
          acc[categoryId] = 0
        }
        acc[categoryId] += transaction.amount
        return acc
      },
      {} as Record<number, number>,
    )

    // Calculate total expenses
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

    // Create category expense objects
    const categoryExpenses: CategoryExpense[] = Object.entries(categoryTotals)
      .map(([categoryId, total]) => {
        const category = mockCategories.find((c) => c.id === Number.parseInt(categoryId))
        if (!category) return null

        return {
          category_name: category.name,
          category_icon: category.icon,
          category_color: category.color,
          total,
          percentage: (total / totalExpenses) * 100,
        }
      })
      .filter((item): item is CategoryExpense => item !== null)
      .sort((a, b) => b.total - a.total)

    return NextResponse.json(categoryExpenses)
  } catch (error) {
    console.error("[v0] Error fetching expenses by category:", error)
    return NextResponse.json({ error: "Error al obtener gastos por categoría" }, { status: 500 })
  }
}
