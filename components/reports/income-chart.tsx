"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CategoryIcon } from "@/components/categories/category-icon"
import { formatCurrency } from "@/lib/format"
import type { CategoryExpense } from "@/lib/types"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

export function IncomeChart() {
  const [incomes, setIncomes] = useState<CategoryExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchIncomes() {
      try {
        const response = await fetch("/api/reports/incomes-by-category")
        const data = await response.json()
        setIncomes(data)
      } catch (error) {
        console.error("[v0] Error fetching incomes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchIncomes()
  }, [])

  const chartData = incomes.map((income) => ({
    name: income.category_name,
    value: income.total,
    color: income.category_color,
  }))

  const totalIncomes = incomes.reduce((sum, income) => sum + income.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Categoría</CardTitle>
        <CardDescription>Distribución de tus ingresos</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : incomes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No hay ingresos para mostrar</div>
        ) : (
          <>
            <div className="h-[300px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {incomes.map((income) => (
                <div key={income.category_name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${income.category_color}20` }}
                    >
                      <CategoryIcon iconName={income.category_icon} size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{income.category_name}</p>
                      <p className="text-xs text-muted-foreground">{income.percentage.toFixed(1)}% del total</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(income.total)}</p>
                </div>
              ))}

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totalIncomes)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
