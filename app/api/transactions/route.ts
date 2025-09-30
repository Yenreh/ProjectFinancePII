import { NextResponse } from "next/server"
import type { Transaction, TransactionWithDetails } from "@/lib/types"

// Mock data for transactions
const mockTransactions: Transaction[] = [
  {
    id: 1,
    account_id: 2,
    category_id: 1,
    type: "ingreso",
    amount: 3000.0,
    description: "Salario mensual",
    date: "2025-01-15",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    account_id: 1,
    category_id: 6,
    type: "gasto",
    amount: 45.5,
    description: "Supermercado",
    date: "2025-01-16",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    account_id: 3,
    category_id: 10,
    type: "gasto",
    amount: 25.0,
    description: "Netflix",
    date: "2025-01-17",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock categories for joining
const mockCategories = [
  { id: 1, name: "Salario", icon: "Briefcase", color: "hsl(145, 60%, 45%)" },
  { id: 6, name: "Alimentación", icon: "UtensilsCrossed", color: "hsl(25, 70%, 50%)" },
  { id: 10, name: "Entretenimiento", icon: "Film", color: "hsl(330, 70%, 55%)" },
]

// Mock accounts for joining
const mockAccounts = [
  { id: 1, name: "Efectivo" },
  { id: 2, name: "Banco Principal" },
  { id: 3, name: "Tarjeta de Crédito" },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const accountId = searchParams.get("accountId")
    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let transactions = mockTransactions

    // Apply filters
    if (type && (type === "ingreso" || type === "gasto")) {
      transactions = transactions.filter((t) => t.type === type)
    }
    if (accountId) {
      transactions = transactions.filter((t) => t.account_id === Number.parseInt(accountId))
    }
    if (categoryId) {
      transactions = transactions.filter((t) => t.category_id === Number.parseInt(categoryId))
    }
    if (startDate) {
      transactions = transactions.filter((t) => t.date >= startDate)
    }
    if (endDate) {
      transactions = transactions.filter((t) => t.date <= endDate)
    }

    // Join with categories and accounts
    const transactionsWithDetails: TransactionWithDetails[] = transactions.map((t) => {
      const category = mockCategories.find((c) => c.id === t.category_id)
      const account = mockAccounts.find((a) => a.id === t.account_id)

      return {
        ...t,
        account_name: account?.name || "Desconocida",
        category_name: category?.name || "Sin categoría",
        category_icon: category?.icon || "Circle",
        category_color: category?.color || "hsl(0, 0%, 50%)",
      }
    })

    // Sort by date descending
    transactionsWithDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(transactionsWithDetails)
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { account_id, category_id, type, amount, description, date } = body

    // Validation
    if (!account_id || !category_id || !type || !amount || !date) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    if (type !== "ingreso" && type !== "gasto") {
      return NextResponse.json({ error: "Tipo de transacción inválido" }, { status: 400 })
    }

    const newTransaction: Transaction = {
      id: Math.max(...mockTransactions.map((t) => t.id), 0) + 1,
      account_id: Number.parseInt(account_id),
      category_id: Number.parseInt(category_id),
      type,
      amount: Number.parseFloat(amount),
      description: description || null,
      date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockTransactions.push(newTransaction)

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating transaction:", error)
    return NextResponse.json({ error: "Error al crear transacción" }, { status: 500 })
  }
}
