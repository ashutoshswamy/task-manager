"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { addDays, addMonths, addWeeks, format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CalendarNav({
  view,
  date,
}: {
  view: string
  date: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function push(nextView: string, nextDate: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", nextView)
    params.set("date", nextDate)
    router.push(`${pathname}?${params.toString()}`)
  }

  function step(direction: 1 | -1) {
    const current = new Date(date)
    const next =
      view === "day"
        ? addDays(current, direction)
        : view === "week"
          ? addWeeks(current, direction)
          : addMonths(current, direction)
    push(view, format(next, "yyyy-MM-dd"))
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={() => step(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => push(view, format(new Date(), "yyyy-MM-dd"))}
        >
          Today
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => step(1)}>
          <ChevronRight className="size-4" />
        </Button>
        <span className="ml-2 text-sm font-medium">
          {format(new Date(date), "MMMM yyyy")}
        </span>
      </div>
      <Tabs value={view} onValueChange={(v) => v && push(v, date)}>
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
