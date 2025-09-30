"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Receipt, Wallet, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/transacciones", label: "Transacciones", icon: Receipt },
  { href: "/cuentas", label: "Cuentas", icon: Wallet },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
