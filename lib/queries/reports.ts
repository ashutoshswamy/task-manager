import "server-only"
import { createClient } from "@/lib/supabase/server"

export type DateRange = { from: string; to: string }

export async function getTaskPerformance(range: DateRange) {
  const supabase = await createClient()
  const [{ count: total }, { count: completed }, { count: overdue }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", range.from)
        .lte("created_at", range.to),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("created_at", range.from)
        .lte("created_at", range.to),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed")
        .not("deadline", "is", null)
        .lt("deadline", new Date().toISOString().slice(0, 10))
        .gte("created_at", range.from)
        .lte("created_at", range.to),
    ])
  const totalCount = total ?? 0
  const completedCount = completed ?? 0
  return {
    total: totalCount,
    completed: completedCount,
    overdue: overdue ?? 0,
    completionRate: totalCount ? Math.round((completedCount / totalCount) * 100) : 0,
  }
}

export async function getFollowUpPerformance(range: DateRange) {
  const supabase = await createClient()
  const [{ count: total }, { count: completed }, { count: pending }] =
    await Promise.all([
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .gte("created_at", range.from)
        .lte("created_at", range.to),
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("created_at", range.from)
        .lte("created_at", range.to),
      supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .gte("created_at", range.from)
        .lte("created_at", range.to),
    ])
  return { total: total ?? 0, completed: completed ?? 0, pending: pending ?? 0 }
}

export async function getMeetingPerformance(range: DateRange) {
  const supabase = await createClient()
  const [{ count: total }, { count: completed }, { count: cancelled }] =
    await Promise.all([
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .gte("date", range.from)
        .lte("date", range.to),
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("date", range.from)
        .lte("date", range.to),
      supabase
        .from("meetings")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled")
        .gte("date", range.from)
        .lte("date", range.to),
    ])
  return { total: total ?? 0, completed: completed ?? 0, cancelled: cancelled ?? 0 }
}
