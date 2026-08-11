import "server-only"
import { createClient } from "@/lib/supabase/server"

const MEETING_SELECT = `
  *,
  sector:sectors(id, name),
  topic:topics(id, name),
  organizer:profiles!meetings_organizer_id_fkey(id, full_name),
  meeting_participants(user:profiles(id, full_name))
`

export async function getMeetings(range?: { from: string; to: string }) {
  const supabase = await createClient()
  let query = supabase
    .from("meetings")
    .select(MEETING_SELECT)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  if (range) query = query.gte("date", range.from).lte("date", range.to)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getMeetingById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("meetings")
    .select(MEETING_SELECT)
    .eq("id", id)
    .single()
  if (error) return null
  return data
}

export async function getMeetingActionItems(meetingId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("meeting_action_items")
    .select("*, assignee:profiles(id, full_name)")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true })
  return data ?? []
}

export async function getMeetingAttachments(meetingId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("documents")
    .select("*, uploader:profiles(id, full_name)")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: false })
  return data ?? []
}

export async function getUpcomingMeetingsForUser(limit = 5) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from("meetings")
    .select("id, title, date, start_time")
    .eq("status", "scheduled")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(limit)
  return data ?? []
}
