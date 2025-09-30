import { NextResponse } from "next/server"
import type { Account } from "@/lib/types"

// Mock data (shared with route.ts in production this would be in a database)
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const accountId = Number.parseInt(id)
    const body = await request.json()

    const accountIndex = mockAccounts.findIndex((acc) => acc.id === accountId)

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
    }

    mockAccounts[accountIndex] = {
      ...mockAccounts[accountIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(mockAccounts[accountIndex])
  } catch (error) {
    console.error("[v0] Error updating account:", error)
    return NextResponse.json({ error: "Error al actualizar cuenta" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const accountId = Number.parseInt(id)

    const accountIndex = mockAccounts.findIndex((acc) => acc.id === accountId)

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
    }

    mockAccounts.splice(accountIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting account:", error)
    return NextResponse.json({ error: "Error al eliminar cuenta" }, { status: 500 })
  }
}
