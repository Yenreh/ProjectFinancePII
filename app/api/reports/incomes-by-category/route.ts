import { NextResponse } from "next/server"
import { dbQueries } from "@/lib/db"

export async function GET() {
  try {
    const incomes = await dbQueries.getIncomesByCategory()
    return NextResponse.json(incomes)
  } catch (error) {
    console.error("[v0] Error fetching incomes by category:", error)
    return NextResponse.json(
      { error: "Error al obtener los ingresos por categoría" },
      { status: 500 }
    )
  }
}
