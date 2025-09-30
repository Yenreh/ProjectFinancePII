import { CategoryIcon } from "./category-icon"
import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  name: string
  icon: string
  color: string
  className?: string
}

export function CategoryBadge({ name, icon, color, className }: CategoryBadgeProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", className)}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <CategoryIcon iconName={icon} size={16} />
      <span>{name}</span>
    </div>
  )
}
