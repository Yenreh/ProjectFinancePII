import { NextResponse } from "next/server"
import type { Category } from "@/lib/types"

// Mock data for categories (in production, this would query the database)
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Salario",
    type: "ingreso",
    icon: "Briefcase",
    color: "hsl(145, 60%, 45%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Freelance",
    type: "ingreso",
    icon: "Laptop",
    color: "hsl(145, 60%, 45%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Inversiones",
    type: "ingreso",
    icon: "TrendingUp",
    color: "hsl(145, 60%, 45%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Ventas",
    type: "ingreso",
    icon: "ShoppingBag",
    color: "hsl(145, 60%, 45%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Otros Ingresos",
    type: "ingreso",
    icon: "Plus",
    color: "hsl(145, 60%, 45%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "Alimentación",
    type: "gasto",
    icon: "UtensilsCrossed",
    color: "hsl(25, 70%, 50%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: "Transporte",
    type: "gasto",
    icon: "Car",
    color: "hsl(200, 70%, 50%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: "Vivienda",
    type: "gasto",
    icon: "Home",
    color: "hsl(280, 60%, 50%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 9,
    name: "Servicios",
    type: "gasto",
    icon: "Zap",
    color: "hsl(45, 90%, 55%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 10,
    name: "Entretenimiento",
    type: "gasto",
    icon: "Film",
    color: "hsl(330, 70%, 55%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 11,
    name: "Salud",
    type: "gasto",
    icon: "Heart",
    color: "hsl(0, 70%, 50%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 12,
    name: "Educación",
    type: "gasto",
    icon: "GraduationCap",
    color: "hsl(210, 70%, 50%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 13,
    name: "Compras",
    type: "gasto",
    icon: "ShoppingCart",
    color: "hsl(300, 60%, 50%)",
    created_at: new Date().toISOString(),
  },
  {
    id: 14,
    name: "Otros Gastos",
    type: "gasto",
    icon: "MoreHorizontal",
    color: "hsl(0, 0%, 50%)",
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let categories = mockCategories

    if (type && (type === "ingreso" || type === "gasto")) {
      categories = categories.filter((cat) => cat.type === type)
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 })
  }
}
