import { NextResponse } from "next/server"
import { dbQueries, sql } from "@/lib/db"
import { mockCategories } from "@/lib/mock-data"
import type { Category } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let categories: Category[] = []

    // Use database if available, otherwise fallback to mock data
    if (sql) {
      try {
        if (type && (type === "ingreso" || type === "gasto")) {
          categories = await dbQueries.getCategories(type)
        } else {
          categories = await dbQueries.getCategories()
        }
      } catch (error) {
        console.error("[v0] Database error, falling back to mock data:", error)
        categories = mockCategories
      }
    } else {
      categories = mockCategories
    }

    // Apply filtering for mock data or if database didn't handle filtering
    if (!sql && type && (type === "ingreso" || type === "gasto")) {
      categories = categories.filter((cat) => cat.type === type)
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 })
  }
}
