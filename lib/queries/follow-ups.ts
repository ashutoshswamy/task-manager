import "server-only"
import { createClient } from "@/lib/supabase/server"

export type FollowUpRow = {
  id: string
  task_id: string
  due_date: string
  status: string
  note: string | null
  task: { id: string; title: string } | null
}

const SELECT = "id, task_id, due_date, status, note, task:tasks(id, title)"
const today = () => new Date().toISOString().slice(0, 10)

export async function getOverdueFollowUps() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("follow_ups")
    .select(SELECT)
    .eq("status", "pending")
    .lt("due_date", today())
    .order("due_date", { ascending: true })
  return (data ?? []) as unknown as FollowUpRow[]
}

export async function getTodayFollowUps() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("follow_ups")
    .select(SELECT)
    .eq("status", "pending")
    .eq("due_date", today())
    .order("due_date", { ascending: true })
  return (data ?? []) as unknown as FollowUpRow[]
}

export async function getUpcomingFollowUps() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("follow_ups")
    .select(SELECT)
    .eq("status", "pending")
    .gt("due_date", today())
    .order("due_date", { ascending: true })
  return (data ?? []) as unknown as FollowUpRow[]
}
