import { NextResponse } from "next/server"
import { dbQueries, sql } from "@/lib/db"
import { mockAccounts } from "@/lib/mock-data"
import type { Account } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get("includeArchived") === "true"

    let accounts: Account[] = []

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        accounts = await dbQueries.getAccounts(includeArchived)
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        accounts = mockAccounts
      }
    } else {
      accounts = mockAccounts
    }

    // Apply filtering for mock data or if database didn't handle filtering
    if (!sql && !includeArchived) {
      accounts = accounts.filter((acc) => !acc.is_archived)
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

    const newAccountData = {
      name,
      type,
      balance: Number.parseFloat(balance),
      currency: currency || "COP",
      is_archived: false,
    }

    let newAccount: Account

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        newAccount = await dbQueries.createAccount(newAccountData)
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        // Fallback to mock data creation
        newAccount = {
          ...newAccountData,
          id: Math.max(...mockAccounts.map((a) => a.id), 0) + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockAccounts.push(newAccount)
      }
    } else {
      // Mock data creation
      newAccount = {
        ...newAccountData,
        id: Math.max(...mockAccounts.map((a) => a.id), 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockAccounts.push(newAccount)
    }

    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating account:", error)
    return NextResponse.json({ error: "Error al crear cuenta" }, { status: 500 })
  }
}
