"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategoryIcon } from "@/components/categories/category-icon"
import { formatCurrency, formatDate } from "@/lib/format"
import type { TransactionWithDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TransactionItemProps {
  transaction: TransactionWithDetails
  onEdit?: (transaction: TransactionWithDetails) => void
  onDelete?: (transaction: TransactionWithDetails) => void
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "ingreso"

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${transaction.category_color}20` }}
      >
        <CategoryIcon iconName={transaction.category_icon} size={20} className="text-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{transaction.category_name}</h4>
            {transaction.description && (
              <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{transaction.account_name}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn("font-semibold text-sm whitespace-nowrap", isIncome ? "text-success" : "text-destructive")}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(transaction)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(transaction)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
