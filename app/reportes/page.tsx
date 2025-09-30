"use client"

import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ExpenseChart } from "@/components/reports/expense-chart"

export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis y visualización de tus finanzas</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ExpenseChart />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
