import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns"
import { getMeetings } from "@/lib/queries/meetings"
import { getSectors, getTopics, getProfiles } from "@/lib/queries/lookups"
import { MeetingViewTabs } from "@/components/meetings/meeting-view-tabs"
import { MeetingListItem } from "@/components/meetings/meeting-list-item"
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog"

function getRange(view: string) {
  const now = new Date()
  if (view === "day") return { from: startOfDay(now), to: endOfDay(now) }
  if (view === "month")
    return { from: startOfMonth(now), to: endOfMonth(now) }
  return { from: startOfWeek(now), to: endOfWeek(now) }
}

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view = "week" } = await searchParams
  const range = getRange(view)
  const [meetings, sectors, topics, profiles] = await Promise.all([
    getMeetings({
      from: format(range.from, "yyyy-MM-dd"),
      to: format(range.to, "yyyy-MM-dd"),
    }),
    getSectors(),
    getTopics(),
    getProfiles(),
  ])

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Meetings</h1>
        <MeetingFormDialog sectors={sectors} topics={topics} profiles={profiles} />
      </div>
      <MeetingViewTabs current={view} />
      {meetings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No meetings in this range.
        </div>
      ) : (
        <div className="grid gap-2">
          {meetings.map((m) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <MeetingListItem key={m.id} meeting={m as any} />
          ))}
        </div>
      )}
    </div>
  )
}
