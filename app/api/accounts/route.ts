import { NextResponse } from "next/server"
import type { Account } from "@/lib/types"

// Mock data for accounts (in production, this would query the database)
const mockAccounts: Account[] = [
  {
    id: 1,
    name: "Efectivo",
    type: "efectivo",
    balance: 500.0,
    currency: "USD",
    is_archived: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Banco Principal",
    type: "banco",
    balance: 5000.0,
    currency: "USD",
    is_archived: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Tarjeta de Crédito",
    type: "tarjeta",
    balance: -1200.0,
    currency: "USD",
    is_archived: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get("includeArchived") === "true"

    let accounts = mockAccounts

    if (!includeArchived) {
      accounts = accounts.filter((acc) => acc.is_archived === 0)
    }

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("[v0] Error fetching accounts:", error)
    return NextResponse.json({ error: "Error al obtener cuentas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, balance, currency } = body

    // Validation
    if (!name || !type || balance === undefined) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const newAccount: Account = {
      id: Math.max(...mockAccounts.map((a) => a.id), 0) + 1,
      name,
      type,
      balance: Number.parseFloat(balance),
      currency: currency || "USD",
      is_archived: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    mockAccounts.push(newAccount)

    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating account:", error)
    return NextResponse.json({ error: "Error al crear cuenta" }, { status: 500 })
  }
}
