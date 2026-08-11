import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants"

const statusStyles: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  on_hold: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("border-0", statusStyles[status])}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

const priorityStyles: Record<string, string> = {
  high: "bg-red-500/15 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  low: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge className={cn("border-0", priorityStyles[priority])}>
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  )
}
