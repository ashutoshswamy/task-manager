import { format, startOfMonth } from "date-fns"
import { ListTodo, CheckCircle2, AlertTriangle } from "lucide-react"
import {
  getTaskPerformance,
  getFollowUpPerformance,
  getMeetingPerformance,
} from "@/lib/queries/reports"
import { getSectorPerformance } from "@/lib/queries/dashboard"
import { getTeamMembers } from "@/lib/queries/team"
import { requireUser } from "@/lib/auth/current-user"
import { StatCard } from "@/components/dashboard/stat-card"
import { WidgetCard } from "@/components/dashboard/widget-card"
import { TeamTable } from "@/components/team/team-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const user = await requireUser()
  const params = await searchParams
  const from = params.from ?? format(startOfMonth(new Date()), "yyyy-MM-dd")
  const to = params.to ?? format(new Date(), "yyyy-MM-dd")

  const [taskPerf, followUpPerf, meetingPerf, sectorPerf, team] =
    await Promise.all([
      getTaskPerformance({ from, to }),
      getFollowUpPerformance({ from, to }),
      getMeetingPerformance({ from, to }),
      getSectorPerformance(),
      getTeamMembers(),
    ])

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <form className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1.5">
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="date" name="from" defaultValue={from} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="date" name="to" defaultValue={to} />
        </div>
        <Button type="submit" size="sm">
          Apply
        </Button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Task Performance
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Tasks" value={taskPerf.total} icon={ListTodo} />
          <StatCard
            label="Completed"
            value={taskPerf.completed}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Overdue"
            value={taskPerf.overdue}
            icon={AlertTriangle}
            tone="danger"
          />
          <StatCard
            label="Completion Rate"
            value={taskPerf.completionRate}
            icon={CheckCircle2}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WidgetCard title="Follow-up Performance">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-xl font-semibold">{followUpPerf.total}</p>
              <p className="text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{followUpPerf.completed}</p>
              <p className="text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{followUpPerf.pending}</p>
              <p className="text-muted-foreground">Pending</p>
            </div>
          </div>
        </WidgetCard>
        <WidgetCard title="Meeting Performance">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-xl font-semibold">{meetingPerf.total}</p>
              <p className="text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{meetingPerf.completed}</p>
              <p className="text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-xl font-semibold">{meetingPerf.cancelled}</p>
              <p className="text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </WidgetCard>
      </div>

      <Card className="grid gap-3 p-4">
        <h3 className="text-sm font-medium">Sector Performance</h3>
        {sectorPerf.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sector data yet.</p>
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

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Team Performance
        </h2>
        <TeamTable members={team} isAdmin={false} currentUserId={user.id} />
      </div>
    </div>
  )
}
