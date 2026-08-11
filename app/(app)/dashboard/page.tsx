import Link from "next/link"
import { format } from "date-fns"
import {
  ListTodo,
  CircleDashed,
  Loader,
  PauseCircle,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  CalendarClock,
} from "lucide-react"
import { requireUser } from "@/lib/auth/current-user"
import {
  getDashboardStats,
  getUpcomingDeadlines,
  getOverdueTasks,
  getTodaysFollowUps,
  getRecentActivity,
  getStatusDistribution,
  getPriorityDistribution,
  getSectorPerformance,
  type TodaysFollowUp,
  type RecentActivityRow,
} from "@/lib/queries/dashboard"
import { StatCard } from "@/components/dashboard/stat-card"
import { DistributionBars } from "@/components/dashboard/distribution-bars"
import { WidgetCard, EmptyState } from "@/components/dashboard/widget-card"
import { PriorityBadge } from "@/components/tasks/badges"
import { Card } from "@/components/ui/card"

export default async function DashboardPage() {
  const user = await requireUser()
  const [
    stats,
    deadlines,
    overdue,
    followUps,
    activity,
    statusDist,
    priorityDist,
    sectorPerf,
  ] = await Promise.all([
    getDashboardStats(),
    getUpcomingDeadlines(),
    getOverdueTasks(),
    getTodaysFollowUps(),
    getRecentActivity(),
    getStatusDistribution(),
    getPriorityDistribution(),
    getSectorPerformance(),
  ])

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.full_name}</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across the team.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} />
        <StatCard
          label="Not Started"
          value={stats.notStarted}
          icon={CircleDashed}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Loader}
          tone="default"
        />
        <StatCard
          label="On Hold"
          value={stats.onHold}
          icon={PauseCircle}
          tone="warning"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Follow-ups Due"
          value={stats.followUpsDue}
          icon={BellRing}
          tone="warning"
        />
        <StatCard
          label="Upcoming Meetings"
          value={stats.upcomingMeetings}
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DistributionBars title="Tasks by Status" data={statusDist} />
        <DistributionBars title="Tasks by Priority" data={priorityDist} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WidgetCard title="Upcoming Deadlines">
          {deadlines.length === 0 ? (
            <EmptyState label="Nothing due soon." />
          ) : (
            <div className="grid gap-2">
              {deadlines.map((t) => (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className="flex items-center justify-between text-sm hover:underline"
                >
                  <span className="truncate">{t.title}</span>
                  <span className="ml-2 flex shrink-0 items-center gap-2 text-muted-foreground">
                    {format(new Date(t.deadline!), "MMM d")}
                    <PriorityBadge priority={t.priority} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </WidgetCard>

        <WidgetCard title="Overdue Tasks">
          {overdue.length === 0 ? (
            <EmptyState label="Nothing overdue. Nice." />
          ) : (
            <div className="grid gap-2">
              {overdue.map((t) => (
                <Link
                  key={t.id}
                  href={`/tasks/${t.id}`}
                  className="flex items-center justify-between text-sm text-destructive hover:underline"
                >
                  <span className="truncate">{t.title}</span>
                  <span className="ml-2 shrink-0">
                    {format(new Date(t.deadline!), "MMM d")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </WidgetCard>

        <WidgetCard title="Today's Follow-ups">
          {followUps.length === 0 ? (
            <EmptyState label="No follow-ups due today." />
          ) : (
            <div className="grid gap-2">
              {followUps.map(
                (f: TodaysFollowUp) => (
                  <Link
                    key={f.id}
                    href={`/tasks/${f.task?.id}`}
                    className="text-sm hover:underline"
                  >
                    {f.task?.title}
                  </Link>
                )
              )}
            </div>
          )}
        </WidgetCard>

        <WidgetCard title="Recent Activity">
          {activity.length === 0 ? (
            <EmptyState label="No activity yet." />
          ) : (
            <div className="grid gap-2">
              {activity.map(
                (a: RecentActivityRow) => (
                  <Link
                    key={a.id}
                    href={`/tasks/${a.task?.id}`}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    <span className="font-medium text-foreground">
                      {a.actor?.full_name}
                    </span>{" "}
                    {a.action.replace("_", " ")} · {a.task?.title}
                  </Link>
                )
              )}
            </div>
          )}
        </WidgetCard>
      </div>

      <Card className="grid gap-3 p-4">
        <h3 className="text-sm font-medium">Sector-wise Performance</h3>
        {sectorPerf.length === 0 ? (
          <EmptyState label="No sector data yet." />
        ) : (
          <div className="grid gap-2">
            {sectorPerf.map((s) => (
              <div key={s.sector} className="grid gap-1">
                <div className="flex justify-between text-sm">
                  <span>{s.sector}</span>
                  <span className="text-muted-foreground">
                    {s.completed}/{s.total} completed ({s.completionRate}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${s.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
