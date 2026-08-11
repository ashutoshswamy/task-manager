"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function completeFollowUp(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("follow_ups")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: user.id,
    })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/follow-ups")
  return { success: true as const }
}

export async function rescheduleFollowUp(id: string, newDueDate: string) {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("follow_ups")
    .select("task_id")
    .eq("id", id)
    .single()
  if (!existing) return { error: "Follow-up not found" }

  const { error } = await supabase
    .from("follow_ups")
    .update({ due_date: newDueDate })
    .eq("id", id)
  if (error) return { error: error.message }

  await supabase
    .from("tasks")
    .update({ next_follow_up_date: newDueDate })
    .eq("id", existing.task_id)

  revalidatePath("/follow-ups")
  return { success: true as const }
}

export async function addFollowUpUpdate(id: string, note: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("follow_ups")
    .update({ note })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/follow-ups")
  return { success: true as const }
}
