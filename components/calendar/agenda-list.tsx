import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { CalendarEvent } from "@/lib/queries/calendar"

const typeLabels: Record<CalendarEvent["type"], string> = {
  meeting: "Meeting",
  deadline: "Deadline",
  followup: "Follow-up",
}

export function AgendaList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No events in this range.
      </div>
    )
  }

  const byDate = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const list = byDate.get(e.date) ?? []
    list.push(e)
    byDate.set(e.date, list)
  }

  return (
    <div className="grid gap-4">
      {[...byDate.entries()].map(([date, dayEvents]) => (
        <div key={date} className="grid gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {format(new Date(date), "EEEE, MMM d")}
          </h3>
          <div className="grid gap-2">
            {dayEvents.map((e) => (
              <Link key={e.id} href={e.href}>
                <Card className="flex items-center justify-between gap-2 p-3 transition-colors hover:bg-muted/40">
                  <span className="text-sm">{e.title}</span>
                  <Badge variant="outline">{typeLabels[e.type]}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
