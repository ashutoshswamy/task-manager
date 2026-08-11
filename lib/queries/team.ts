import "server-only"
import { createClient } from "@/lib/supabase/server"

export type TeamMember = {
  id: string
  full_name: string
  email: string
  role: string
  department: string | null
  active: boolean
  assigned: number
  completed: number
  overdue: number
  followUps: number
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name")
  if (!profiles) return []

  const today = new Date().toISOString().slice(0, 10)

  return Promise.all(
    profiles.map(async (p) => {
      const { data: assignments } = await supabase
        .from("task_assignees")
        .select("task_id")
        .eq("user_id", p.id)
      const taskIds = (assignments ?? []).map((a) => a.task_id)

      let assigned = 0
      let completed = 0
      let overdue = 0
      if (taskIds.length) {
        const { count: assignedCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .in("id", taskIds)
          .eq("archived", false)
        const { count: completedCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .in("id", taskIds)
          .eq("status", "completed")
        const { count: overdueCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .in("id", taskIds)
          .eq("archived", false)
          .neq("status", "completed")
          .lt("deadline", today)
        assigned = assignedCount ?? 0
        completed = completedCount ?? 0
        overdue = overdueCount ?? 0
      }

      const { count: followUps } = await supabase
        .from("follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("created_by", p.id)
        .eq("status", "pending")

      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
        department: p.department,
        active: p.active,
        assigned,
        completed,
        overdue,
        followUps: followUps ?? 0,
      }
    })
  )
}
