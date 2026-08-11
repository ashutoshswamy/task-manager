import {
  getOverdueFollowUps,
  getTodayFollowUps,
  getUpcomingFollowUps,
} from "@/lib/queries/follow-ups"
import { FollowUpCard } from "@/components/follow-ups/follow-up-card"

function Section({
  title,
  items,
}: {
  title: string
  items: Awaited<ReturnType<typeof getOverdueFollowUps>>
}) {
  return (
    <div className="grid gap-2">
      <h2 className="text-sm font-medium text-muted-foreground">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <div className="grid gap-2">
          {items.map((f) => (
            <FollowUpCard key={f.id} followUp={f} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function FollowUpsPage() {
  const [overdue, today, upcoming] = await Promise.all([
    getOverdueFollowUps(),
    getTodayFollowUps(),
    getUpcomingFollowUps(),
  ])

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Follow-ups</h1>
      <Section title="Overdue" items={overdue} />
      <Section title="Today" items={today} />
      <Section title="Upcoming" items={upcoming} />
    </div>
  )
}
