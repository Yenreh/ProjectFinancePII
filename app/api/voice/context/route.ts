import { NextResponse } from "next/server"
import { dbQueries } from "@/lib/db"

export async function GET() {
  try {
    // Obtener categorías y cuentas para el contexto del asistente
    const [categories, accounts] = await Promise.all([
      dbQueries.getCategories(),
      dbQueries.getAccounts(),
    ])

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      })),
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
      })),
    })

  } catch (error) {
    console.error("Error obteniendo contexto del asistente:", error)
    return NextResponse.json(
      { error: "Error al obtener el contexto" },
      { status: 500 }
    )
  }
}
