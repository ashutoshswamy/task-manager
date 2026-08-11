import "server-only"
import { createClient } from "@/lib/supabase/server"

export type NotificationRow = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export async function getNotifications(userId: string, limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as NotificationRow[]
}
