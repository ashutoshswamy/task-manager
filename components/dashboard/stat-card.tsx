import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: number
  icon: LucideIcon
  tone?: "default" | "warning" | "danger" | "success"
}) {
  const toneStyles = {
    default: "text-foreground",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-destructive",
    success: "text-emerald-600 dark:text-emerald-400",
  }[tone]

  return (
    <Card className="flex-row items-center gap-3 p-4">
      <div className="shrink-0 rounded-md bg-muted p-2">
        <Icon className={cn("size-5", toneStyles)} />
      </div>
      <div className="min-w-0">
        <p className={cn("text-2xl font-semibold leading-tight", toneStyles)}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}
