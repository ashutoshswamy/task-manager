"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/")
  return { success: true as const }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)
  if (error) return { error: error.message }

  revalidatePath("/")
  return { success: true as const }
}
