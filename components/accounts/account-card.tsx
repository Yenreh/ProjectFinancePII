"use client"

import { Wallet, CreditCard, Banknote, MoreVertical, Archive, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/format"
import type { Account } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AccountCardProps {
  account: Account
  onEdit?: (account: Account) => void
  onArchive?: (account: Account) => void
  onDelete?: (account: Account) => void
}

const accountIcons = {
  efectivo: Banknote,
  banco: Wallet,
  tarjeta: CreditCard,
}

export function AccountCard({ account, onEdit, onArchive, onDelete }: AccountCardProps) {
  const Icon = accountIcons[account.type]
  const isNegative = account.balance < 0

  return (
    <Card className={cn("transition-all hover:shadow-md", account.is_archived === 1 && "opacity-60")}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{account.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(account)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onArchive && account.is_archived === 0 && (
                <DropdownMenuItem onClick={() => onArchive(account)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archivar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onDelete(account)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-1">Saldo</p>
          <p className={cn("text-2xl font-bold", isNegative ? "text-destructive" : "text-foreground")}>
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>

        {account.is_archived === 1 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Archive className="h-4 w-4" />
            <span>Cuenta archivada</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
