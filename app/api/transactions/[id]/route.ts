import { NextResponse } from "next/server"
import type { Transaction } from "@/lib/types"

// Mock data (shared with route.ts)
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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const transactionId = Number.parseInt(id)
    const body = await request.json()

    const transactionIndex = mockTransactions.findIndex((t) => t.id === transactionId)

    if (transactionIndex === -1) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
    }

    mockTransactions[transactionIndex] = {
      ...mockTransactions[transactionIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(mockTransactions[transactionIndex])
  } catch (error) {
    console.error("[v0] Error updating transaction:", error)
    return NextResponse.json({ error: "Error al actualizar transacción" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const transactionId = Number.parseInt(id)

    const transactionIndex = mockTransactions.findIndex((t) => t.id === transactionId)

    if (transactionIndex === -1) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
    }

    mockTransactions.splice(transactionIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting transaction:", error)
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 })
  }
}
