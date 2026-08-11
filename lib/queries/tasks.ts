import "server-only"
import { createClient } from "@/lib/supabase/server"

const TASK_SELECT = `
  *,
  sector:sectors(id, name),
  topic:topics(id, name),
  creator:profiles!tasks_created_by_fkey(id, full_name),
  task_assignees(user:profiles(id, full_name))
`

export type TaskFilters = {
  status?: string
  priority?: string
  sectorId?: string
  assigneeId?: string
  search?: string
  archived?: boolean
  overdue?: boolean
}

export async function getTasks(filters: TaskFilters = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("created_at", { ascending: false })

  query = query.eq("archived", filters.archived ?? false)
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.priority) query = query.eq("priority", filters.priority)
  if (filters.sectorId) query = query.eq("sector_id", filters.sectorId)
  if (filters.search) query = query.ilike("title", `%${filters.search}%`)
  if (filters.overdue) {
    query = query
      .lt("deadline", new Date().toISOString().slice(0, 10))
      .neq("status", "completed")
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  let tasks = data ?? []
  if (filters.assigneeId) {
    tasks = tasks.filter((t) =>
      t.task_assignees.some(
        (a: { user: { id: string } }) => a.user?.id === filters.assigneeId
      )
    )
  }
  return tasks
}

export async function getTaskById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("id", id)
    .single()
  if (error) return null
  return data
}

export async function getTaskComments(taskId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("task_comments")
    .select("*, author:profiles(id, full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getTaskActivity(taskId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("task_activity")
    .select("*, actor:profiles(id, full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getTaskAttachments(taskId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("documents")
    .select("*, uploader:profiles(id, full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getMyTasks(userId: string) {
  const all = await getTasks()
  return all.filter(
    (t) =>
      t.created_by === userId ||
      t.task_assignees.some(
        (a: { user: { id: string } }) => a.user?.id === userId
      )
  )
}
