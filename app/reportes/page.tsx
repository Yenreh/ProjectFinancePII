"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { ExpenseChart } from "@/components/reports/expense-chart"
import { IncomeChart } from "@/components/reports/income-chart"

export default function ReportesPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis y visualización de tus finanzas</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseChart />
          <IncomeChart />
        </div>
      </div>
    </AppLayout>
  )
}
