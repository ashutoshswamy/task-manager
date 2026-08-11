import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns"
import { getCalendarEvents } from "@/lib/queries/calendar"
import { CalendarNav } from "@/components/calendar/calendar-nav"
import { MonthGrid } from "@/components/calendar/month-grid"
import { AgendaList } from "@/components/calendar/agenda-list"

function getRange(view: string, date: Date) {
  if (view === "day") return { from: startOfDay(date), to: endOfDay(date) }
  if (view === "month")
    return { from: startOfMonth(date), to: endOfMonth(date) }
  return { from: startOfWeek(date), to: endOfWeek(date) }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>
}) {
  const { view = "month", date: dateParam } = await searchParams
  const date = dateParam ? new Date(dateParam) : new Date()
  const range = getRange(view, date)
  const events = await getCalendarEvents(
    format(range.from, "yyyy-MM-dd"),
    format(range.to, "yyyy-MM-dd")
  )

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <CalendarNav view={view} date={format(date, "yyyy-MM-dd")} />
      {view === "month" ? (
        <MonthGrid month={date} events={events} />
      ) : (
        <AgendaList events={events} />
      )}
    </div>
  )
}
