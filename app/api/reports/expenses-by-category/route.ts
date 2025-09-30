import { NextResponse } from "next/server"
import { dbQueries, sql } from "@/lib/db"
import { mockTransactions, mockCategories } from "@/lib/mock-data"
import type { CategoryExpense } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let categoryExpenses: CategoryExpense[] = []

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        const filters = {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
        categoryExpenses = await dbQueries.getExpensesByCategory(filters)
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        // Fallback to mock data calculation
        categoryExpenses = calculateMockExpensesByCategory()
      }
    } else {
      // Mock data calculation
      categoryExpenses = calculateMockExpensesByCategory()
    }

    return NextResponse.json(categoryExpenses)
  } catch (error) {
    console.error("[v0] Error fetching expenses by category:", error)
    return NextResponse.json({ error: "Error al obtener gastos por categoría" }, { status: 500 })
  }
}

function calculateMockExpensesByCategory(): CategoryExpense[] {
  // Filter expenses only from mock transactions
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
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      }
    })
    .filter((item): item is CategoryExpense => item !== null)
    .sort((a, b) => b.total - a.total)

  return categoryExpenses
}
