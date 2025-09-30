import type { Account, Category, Transaction, TransactionWithDetails } from "./types"

// Shared mock data for development/fallback
export const mockCategories: Category[] = [
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

export const mockAccounts: Account[] = [
  {
    id: 1,
    name: "Efectivo",
    type: "efectivo",
    balance: 500.0,
    currency: "USD",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Banco Principal",
    type: "banco",
    balance: 5000.0,
    currency: "USD",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Tarjeta de Crédito",
    type: "tarjeta",
    balance: -1200.0,
    currency: "USD",
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockTransactions: Transaction[] = [
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

// Helper function to create mock transactions with details
export function createMockTransactionsWithDetails(): TransactionWithDetails[] {
  return mockTransactions.map((t) => {
    const category = mockCategories.find((c) => c.id === t.category_id)
    const account = mockAccounts.find((a) => a.id === t.account_id)

    return {
      ...t,
      account_name: account?.name || "Desconocida",
      category_name: category?.name || "Sin categoría",
      category_icon: category?.icon || "Circle",
      category_color: category?.color || "hsl(0, 0%, 50%)",
    }
  })
}