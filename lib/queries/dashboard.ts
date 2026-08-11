import "server-only"
import { createClient } from "@/lib/supabase/server"

const today = () => new Date().toISOString().slice(0, 10)

export async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: total },
    { count: notStarted },
    { count: inProgress },
    { count: onHold },
    { count: completed },
    { count: overdue },
    { count: followUpsDue },
    { count: upcomingMeetings },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("archived", false),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .eq("status", "not_started"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .eq("status", "in_progress"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .eq("status", "on_hold"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .eq("status", "completed"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("archived", false)
      .lt("deadline", today())
      .neq("status", "completed"),
    supabase
      .from("follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lte("due_date", today()),
    supabase
      .from("meetings")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled")
      .gte("date", today()),
  ])

  return {
    total: total ?? 0,
    notStarted: notStarted ?? 0,
    inProgress: inProgress ?? 0,
    onHold: onHold ?? 0,
    completed: completed ?? 0,
    overdue: overdue ?? 0,
    followUpsDue: followUpsDue ?? 0,
    upcomingMeetings: upcomingMeetings ?? 0,
  }
}

export async function getUpcomingDeadlines(limit = 6) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tasks")
    .select("id, title, deadline, priority")
    .eq("archived", false)
    .neq("status", "completed")
    .gte("deadline", today())
    .order("deadline", { ascending: true })
    .limit(limit)
  return data ?? []
}

export async function getOverdueTasks(limit = 6) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("tasks")
    .select("id, title, deadline, priority")
    .eq("archived", false)
    .neq("status", "completed")
    .lt("deadline", today())
    .order("deadline", { ascending: true })
    .limit(limit)
  return data ?? []
}

export type TodaysFollowUp = {
  id: string
  due_date: string
  note: string | null
  task: { id: string; title: string } | null
}

export async function getTodaysFollowUps(limit = 6) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("follow_ups")
    .select("id, due_date, note, task:tasks(id, title)")
    .eq("status", "pending")
    .eq("due_date", today())
    .limit(limit)
  return (data ?? []) as unknown as TodaysFollowUp[]
}

export type RecentActivityRow = {
  id: string
  action: string
  created_at: string
  actor: { full_name: string } | null
  task: { id: string; title: string } | null
}

export async function getRecentActivity(limit = 8) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("task_activity")
    .select("id, action, created_at, actor:profiles(full_name), task:tasks(id, title)")
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as unknown as RecentActivityRow[]
}

export async function getStatusDistribution() {
  const stats = await getDashboardStats()
  return [
    { name: "Not Started", value: stats.notStarted },
    { name: "In Progress", value: stats.inProgress },
    { name: "On Hold", value: stats.onHold },
    { name: "Completed", value: stats.completed },
  ]
}

export async function getPriorityDistribution() {
  const supabase = await createClient()
  const [{ count: high }, { count: medium }, { count: low }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("archived", false)
        .eq("priority", "high"),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("archived", false)
        .eq("priority", "medium"),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("archived", false)
        .eq("priority", "low"),
    ])
  return [
    { name: "High", value: high ?? 0 },
    { name: "Medium", value: medium ?? 0 },
    { name: "Low", value: low ?? 0 },
  ]
}

export async function getSectorPerformance() {
  const supabase = await createClient()
  const { data: sectors } = await supabase.from("sectors").select("id, name")
  if (!sectors) return []

  const results = await Promise.all(
    sectors.map(async (sector) => {
      const [{ count: total }, { count: completed }] = await Promise.all([
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("archived", false)
          .eq("sector_id", sector.id),
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("archived", false)
          .eq("sector_id", sector.id)
          .eq("status", "completed"),
      ])
      return {
        sector: sector.name,
        total: total ?? 0,
        completed: completed ?? 0,
        completionRate: total ? Math.round(((completed ?? 0) / total) * 100) : 0,
      }
    })
  )
  return results.filter((r) => r.total > 0)
}
