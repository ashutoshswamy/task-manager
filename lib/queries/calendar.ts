import "server-only"
import { createClient } from "@/lib/supabase/server"

export type CalendarEvent = {
  id: string
  date: string
  title: string
  type: "meeting" | "deadline" | "followup"
  href: string
}

export async function getCalendarEvents(from: string, to: string) {
  const supabase = await createClient()

  const [meetingsRes, deadlinesRes, followUpsRes] = await Promise.all([
    supabase
      .from("meetings")
      .select("id, title, date")
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("tasks")
      .select("id, title, deadline")
      .eq("archived", false)
      .not("deadline", "is", null)
      .gte("deadline", from)
      .lte("deadline", to),
    supabase
      .from("follow_ups")
      .select("id, due_date, task:tasks(id, title)")
      .eq("status", "pending")
      .gte("due_date", from)
      .lte("due_date", to),
  ])

  const events: CalendarEvent[] = []

  for (const m of meetingsRes.data ?? []) {
    events.push({
      id: `meeting-${m.id}`,
      date: m.date,
      title: m.title,
      type: "meeting",
      href: `/meetings/${m.id}`,
    })
  }
  for (const t of deadlinesRes.data ?? []) {
    events.push({
      id: `deadline-${t.id}`,
      date: t.deadline as string,
      title: t.title,
      type: "deadline",
      href: `/tasks/${t.id}`,
    })
  }
  for (const f of (followUpsRes.data ?? []) as unknown as {
    id: string
    due_date: string
    task: { id: string; title: string } | null
  }[]) {
    events.push({
      id: `followup-${f.id}`,
      date: f.due_date,
      title: f.task?.title ?? "Follow-up",
      type: "followup",
      href: `/tasks/${f.task?.id}`,
    })
  }

  return events
}
