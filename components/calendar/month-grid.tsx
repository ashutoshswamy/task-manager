import Link from "next/link"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/queries/calendar"

const typeStyles: Record<CalendarEvent["type"], string> = {
  meeting: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  deadline: "bg-red-500/15 text-red-600 dark:text-red-400",
  followup: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
}

export function MonthGrid({
  month,
  events,
}: {
  month: Date
  events: CalendarEvent[]
}) {
  const start = startOfWeek(startOfMonth(month))
  const end = endOfWeek(endOfMonth(month))
  const days = eachDayOfInterval({ start, end })

  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const list = eventsByDate.get(e.date) ?? []
    list.push(e)
    eventsByDate.set(e.date, list)
  }

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div
          key={d}
          className="bg-muted px-2 py-1 text-center text-xs font-medium text-muted-foreground"
        >
          {d}
        </div>
      ))}
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd")
        const dayEvents = eventsByDate.get(dateStr) ?? []
        return (
          <div
            key={dateStr}
            className={cn(
              "min-h-24 bg-background p-1.5",
              !isSameMonth(day, month) && "bg-muted/30 text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "text-xs",
                isToday(day) &&
                  "inline-flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </span>
            <div className="mt-1 grid gap-0.5">
              {dayEvents.slice(0, 3).map((e) => (
                <Link
                  key={e.id}
                  href={e.href}
                  className={cn(
                    "truncate rounded px-1 py-0.5 text-[11px]",
                    typeStyles[e.type]
                  )}
                >
                  {e.title}
                </Link>
              ))}
              {dayEvents.length > 3 && (
                <span className="text-[11px] text-muted-foreground">
                  +{dayEvents.length - 3} more
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
