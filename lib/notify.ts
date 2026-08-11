import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

type NotificationType =
  | "task_assigned"
  | "status_changed"
  | "comment_added"
  | "deadline_upcoming"
  | "task_overdue"
  | "follow_up_due"
  | "meeting_reminder"
  | "meeting_invite"

// Not a server action (no "use server" in this file) — this uses the
// service-role client to bypass RLS (recipients ≠ caller), so it must only
// ever be called from already-authorized server actions, never exposed
// directly to the client.
export async function notifyUsers(
  userIds: string[],
  notification: { type: NotificationType; title: string; body?: string; link?: string }
) {
  if (userIds.length === 0) return
  const admin = createAdminClient()
  await admin.from("notifications").insert(
    userIds.map((userId) => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      body: notification.body ?? null,
      link: notification.link ?? null,
    }))
  )
}
