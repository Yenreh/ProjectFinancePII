import { NextResponse } from "next/server"
import { dbQueries, sql } from "@/lib/db"
import { mockTransactions } from "@/lib/mock-data"
import type { Transaction } from "@/lib/types"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const transactionId = Number.parseInt(id)
    const body = await request.json()

    let updatedTransaction: Transaction

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        updatedTransaction = await dbQueries.updateTransaction(transactionId, body)
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        // Fallback to mock data update
        const transactionIndex = mockTransactions.findIndex((t) => t.id === transactionId)
        if (transactionIndex === -1) {
          return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
        }

        mockTransactions[transactionIndex] = {
          ...mockTransactions[transactionIndex],
          ...body,
          updated_at: new Date().toISOString(),
        }
        updatedTransaction = mockTransactions[transactionIndex]
      }
    } else {
      // Mock data update
      const transactionIndex = mockTransactions.findIndex((t) => t.id === transactionId)
      if (transactionIndex === -1) {
        return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
      }

      mockTransactions[transactionIndex] = {
        ...mockTransactions[transactionIndex],
        ...body,
        updated_at: new Date().toISOString(),
      }
      updatedTransaction = mockTransactions[transactionIndex]
    }

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("[v0] Error updating transaction:", error)
    return NextResponse.json({ error: "Error al actualizar transacción" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const transactionId = Number.parseInt(id)

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        const success = await dbQueries.deleteTransaction(transactionId)
        if (!success) {
          return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
        }
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        // Fallback to mock data deletion
        const transactionIndex = mockTransactions.findIndex((t) => t.id === transactionId)
        if (transactionIndex === -1) {
          return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
        }
        mockTransactions.splice(transactionIndex, 1)
      }
    } else {
      // Mock data deletion
      const transactionIndex = mockTransactions.findIndex((t) => t.id === transactionId)
      if (transactionIndex === -1) {
        return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
      }
      mockTransactions.splice(transactionIndex, 1)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting transaction:", error)
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 })
  }
}
