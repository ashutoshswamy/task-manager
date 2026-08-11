"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { taskSchema, commentSchema, type TaskInput } from "@/lib/validations/task"
import { notifyUsers } from "@/lib/notify"

async function currentUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  actorId: string,
  action: string,
  fromValue?: string | null,
  toValue?: string | null
) {
  await supabase.from("task_activity").insert({
    task_id: taskId,
    actor_id: actorId,
    action,
    from_value: fromValue ?? null,
    to_value: toValue ?? null,
  })
}

function toRow(input: TaskInput) {
  return {
    sector_id: input.sectorId,
    topic_id: input.topicId,
    title: input.title,
    description: input.description || null,
    priority: input.priority,
    status: input.status,
    start_date: input.startDate,
    deadline: input.deadline || null,
    next_action: input.nextAction || null,
    next_follow_up_date: input.nextFollowUpDate || null,
    remarks: input.remarks || null,
  }
}

export async function createTask(input: TaskInput) {
  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({ ...toRow(parsed.data), created_by: userId })
    .select()
    .single()
  if (error) return { error: error.message }

  if (parsed.data.assigneeIds.length) {
    await supabase.from("task_assignees").insert(
      parsed.data.assigneeIds.map((userId) => ({
        task_id: task.id,
        user_id: userId,
      }))
    )
    await notifyUsers(
      parsed.data.assigneeIds.filter((id) => id !== userId),
      {
        type: "task_assigned",
        title: `You were assigned to "${task.title}"`,
        link: `/tasks/${task.id}`,
      }
    )
  }

  await logActivity(supabase, task.id, userId, "created")
  if (parsed.data.nextFollowUpDate) {
    await supabase.from("follow_ups").insert({
      task_id: task.id,
      due_date: parsed.data.nextFollowUpDate,
      created_by: userId,
    })
  }

  revalidatePath("/tasks")
  return { success: true as const, taskId: task.id as string }
}

export async function updateTask(taskId: string, input: TaskInput) {
  const parsed = taskSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { data: existing } = await supabase
    .from("tasks")
    .select("status, priority, next_follow_up_date")
    .eq("id", taskId)
    .single()

  const { error } = await supabase
    .from("tasks")
    .update({ ...toRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", taskId)
  if (error) return { error: error.message }

  await supabase.from("task_assignees").delete().eq("task_id", taskId)
  if (parsed.data.assigneeIds.length) {
    await supabase.from("task_assignees").insert(
      parsed.data.assigneeIds.map((userId) => ({
        task_id: taskId,
        user_id: userId,
      }))
    )
  }

  if (existing && existing.status !== parsed.data.status) {
    await logActivity(
      supabase,
      taskId,
      userId,
      "status_change",
      existing.status,
      parsed.data.status
    )
  }
  if (existing && existing.priority !== parsed.data.priority) {
    await logActivity(
      supabase,
      taskId,
      userId,
      "priority_change",
      existing.priority,
      parsed.data.priority
    )
  }
  if (
    parsed.data.nextFollowUpDate &&
    existing?.next_follow_up_date !== parsed.data.nextFollowUpDate
  ) {
    await supabase.from("follow_ups").insert({
      task_id: taskId,
      due_date: parsed.data.nextFollowUpDate,
      created_by: userId,
    })
    await logActivity(supabase, taskId, userId, "follow_up")
  }
  await logActivity(supabase, taskId, userId, "updated")

  revalidatePath("/tasks")
  revalidatePath(`/tasks/${taskId}`)
  return { success: true as const }
}

export async function setTaskArchived(taskId: string, archived: boolean) {
  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { error } = await supabase
    .from("tasks")
    .update({ archived })
    .eq("id", taskId)
  if (error) return { error: error.message }

  await logActivity(supabase, taskId, userId, "archived", null, String(archived))
  revalidatePath("/tasks")
  revalidatePath(`/tasks/${taskId}`)
  return { success: true as const }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").delete().eq("id", taskId)
  if (error) return { error: error.message }

  revalidatePath("/tasks")
  return { success: true as const }
}

export async function addComment(input: { taskId: string; body: string }) {
  const parsed = commentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { error } = await supabase.from("task_comments").insert({
    task_id: parsed.data.taskId,
    author_id: userId,
    body: parsed.data.body,
  })
  if (error) return { error: error.message }

  await logActivity(supabase, parsed.data.taskId, userId, "comment")

  const { data: task } = await supabase
    .from("tasks")
    .select("title, created_by, task_assignees(user_id)")
    .eq("id", parsed.data.taskId)
    .single()
  if (task) {
    const recipients = new Set<string>([
      task.created_by,
      ...(task.task_assignees ?? []).map((a: { user_id: string }) => a.user_id),
    ])
    recipients.delete(userId)
    await notifyUsers([...recipients], {
      type: "comment_added",
      title: `New comment on "${task.title}"`,
      link: `/tasks/${parsed.data.taskId}`,
    })
  }

  revalidatePath(`/tasks/${parsed.data.taskId}`)
  return { success: true as const }
}

export async function bulkUpdateStatus(taskIds: string[], status: string) {
  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", taskIds)
  if (error) return { error: error.message }

  for (const taskId of taskIds) {
    await logActivity(supabase, taskId, userId, "status_change", null, status)
  }
  revalidatePath("/tasks")
  return { success: true as const }
}

export async function bulkSetArchived(taskIds: string[], archived: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("tasks")
    .update({ archived })
    .in("id", taskIds)
  if (error) return { error: error.message }

  revalidatePath("/tasks")
  return { success: true as const }
}

export async function uploadAttachment(formData: FormData) {
  const taskId = formData.get("taskId") as string
  const file = formData.get("file") as File
  if (!file || file.size === 0) return { error: "No file selected" }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `tasks/${taskId}/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file)
  if (uploadError) return { error: uploadError.message }

  const { error } = await supabase.from("documents").insert({
    storage_path: path,
    filename: file.name,
    size: file.size,
    mime_type: file.type || "application/octet-stream",
    uploaded_by: userId,
    task_id: taskId,
  })
  if (error) return { error: error.message }

  await logActivity(supabase, taskId, userId, "attachment")
  revalidatePath(`/tasks/${taskId}`)
  return { success: true as const }
}
