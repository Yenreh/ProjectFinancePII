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
        // Obtener la transacción original para revertir su efecto
        const transactions = await dbQueries.getTransactions({})
        const originalTransaction = transactions.find(t => t.id === transactionId)
        
        if (!originalTransaction) {
          return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
        }

        // Obtener todas las cuentas
        const accounts = await dbQueries.getAccounts(true)
        const originalAccount = accounts.find(a => a.id === originalTransaction.account_id)
        
        if (!originalAccount) {
          return NextResponse.json({ error: "Cuenta original no encontrada" }, { status: 404 })
        }

        // Revertir el efecto de la transacción original
        let accountBalance = originalAccount.balance
        if (originalTransaction.type === "ingreso") {
          accountBalance -= originalTransaction.amount
        } else {
          accountBalance += originalTransaction.amount
        }

        // Actualizar la transacción
        updatedTransaction = await dbQueries.updateTransaction(transactionId, body)

        // Aplicar el efecto de la transacción actualizada
        const newAccountId = body.account_id || originalTransaction.account_id
        const newType = body.type || originalTransaction.type
        const newAmount = body.amount !== undefined ? Number.parseFloat(body.amount) : originalTransaction.amount

        // Si la cuenta cambió, necesitamos actualizar ambas cuentas
        if (newAccountId !== originalTransaction.account_id) {
          // Actualizar la cuenta original (ya revertimos el efecto)
          await dbQueries.updateAccount(originalTransaction.account_id, { balance: accountBalance })
          
          // Obtener la nueva cuenta
          const newAccount = accounts.find(a => a.id === newAccountId)
          if (!newAccount) {
            return NextResponse.json({ error: "Nueva cuenta no encontrada" }, { status: 404 })
          }
          
          // Aplicar el efecto en la nueva cuenta
          const newAccountBalance = newType === "ingreso"
            ? newAccount.balance + newAmount
            : newAccount.balance - newAmount
          
          await dbQueries.updateAccount(newAccountId, { balance: newAccountBalance })
        } else {
          // Misma cuenta, aplicar el efecto de la transacción actualizada
          const finalBalance = newType === "ingreso"
            ? accountBalance + newAmount
            : accountBalance - newAmount
          
          await dbQueries.updateAccount(originalTransaction.account_id, { balance: finalBalance })
        }

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
        // Obtener la transacción antes de eliminarla para revertir su efecto
        const transactions = await dbQueries.getTransactions({})
        const transaction = transactions.find(t => t.id === transactionId)
        
        if (!transaction) {
          return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 })
        }

        // Obtener la cuenta
        const accounts = await dbQueries.getAccounts(true)
        const account = accounts.find(a => a.id === transaction.account_id)
        
        if (!account) {
          return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
        }

        // Revertir el efecto de la transacción en el balance
        const newBalance = transaction.type === "ingreso"
          ? account.balance - transaction.amount
          : account.balance + transaction.amount

        // Actualizar el balance de la cuenta
        await dbQueries.updateAccount(transaction.account_id, { balance: newBalance })

        // Eliminar la transacción
        const success = await dbQueries.deleteTransaction(transactionId)
        if (!success) {
          return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 })
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
