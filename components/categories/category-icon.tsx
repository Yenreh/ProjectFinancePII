import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface CategoryIconProps {
  iconName: string
  className?: string
  size?: number
}

export function CategoryIcon({ iconName, className, size = 20 }: CategoryIconProps) {
  const Icon = (Icons[iconName as keyof typeof Icons] as LucideIcon) || Icons.Circle

  return <Icon className={className} size={size} />
}
