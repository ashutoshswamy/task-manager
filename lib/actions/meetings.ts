"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { generateOccurrenceDates } from "@/lib/recurrence"
import { notifyUsers } from "@/lib/notify"
import {
  meetingSchema,
  meetingNotesSchema,
  actionItemSchema,
  type MeetingInput,
  type MeetingNotesInput,
  type ActionItemInput,
} from "@/lib/validations/meeting"

async function currentUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

function toRow(input: MeetingInput) {
  return {
    title: input.title,
    description: input.description || null,
    date: input.date,
    start_time: input.startTime,
    end_time: input.endTime,
    location: input.location || null,
    meeting_link: input.meetingLink || null,
    sector_id: input.sectorId,
    topic_id: input.topicId,
    agenda: input.agenda || null,
  }
}

export async function createMeeting(input: MeetingInput) {
  const parsed = meetingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert({
      ...toRow(parsed.data),
      organizer_id: userId,
      recurrence: parsed.data.recurrence.type !== "none" ? parsed.data.recurrence : null,
    })
    .select()
    .single()
  if (error) return { error: error.message }

  if (parsed.data.participantIds.length) {
    await supabase.from("meeting_participants").insert(
      parsed.data.participantIds.map((userId) => ({
        meeting_id: meeting.id,
        user_id: userId,
      }))
    )
    await notifyUsers(
      parsed.data.participantIds.filter((id) => id !== userId),
      {
        type: "meeting_invite",
        title: `Invited to "${meeting.title}"`,
        link: `/meetings/${meeting.id}`,
      }
    )
  }

  const occurrenceDates = generateOccurrenceDates(
    parsed.data.date,
    parsed.data.recurrence
  )
  if (occurrenceDates.length) {
    const { data: occurrences } = await supabase
      .from("meetings")
      .insert(
        occurrenceDates.map((date) => ({
          ...toRow(parsed.data),
          date,
          organizer_id: userId,
          parent_meeting_id: meeting.id,
        }))
      )
      .select("id")

    if (occurrences?.length && parsed.data.participantIds.length) {
      await supabase.from("meeting_participants").insert(
        occurrences.flatMap((occ) =>
          parsed.data.participantIds.map((userId) => ({
            meeting_id: occ.id,
            user_id: userId,
          }))
        )
      )
    }
  }

  revalidatePath("/meetings")
  revalidatePath("/calendar")
  return { success: true as const, meetingId: meeting.id as string }
}

export async function updateMeeting(meetingId: string, input: MeetingInput) {
  const parsed = meetingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from("meetings")
    .update(toRow(parsed.data))
    .eq("id", meetingId)
  if (error) return { error: error.message }

  await supabase.from("meeting_participants").delete().eq("meeting_id", meetingId)
  if (parsed.data.participantIds.length) {
    await supabase.from("meeting_participants").insert(
      parsed.data.participantIds.map((userId) => ({
        meeting_id: meetingId,
        user_id: userId,
      }))
    )
  }

  revalidatePath("/meetings")
  revalidatePath(`/meetings/${meetingId}`)
  revalidatePath("/calendar")
  return { success: true as const }
}

export async function updateMeetingNotes(
  meetingId: string,
  input: MeetingNotesInput
) {
  const parsed = meetingNotesSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from("meetings")
    .update({
      notes: parsed.data.notes || null,
      decisions: parsed.data.decisions || null,
      status: parsed.data.status,
    })
    .eq("id", meetingId)
  if (error) return { error: error.message }

  revalidatePath(`/meetings/${meetingId}`)
  return { success: true as const }
}

export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("meetings").delete().eq("id", meetingId)
  if (error) return { error: error.message }

  revalidatePath("/meetings")
  revalidatePath("/calendar")
  return { success: true as const }
}

export async function addActionItem(input: ActionItemInput) {
  const parsed = actionItemSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from("meeting_action_items").insert({
    meeting_id: parsed.data.meetingId,
    description: parsed.data.description,
    assignee_id: parsed.data.assigneeId,
  })
  if (error) return { error: error.message }

  revalidatePath(`/meetings/${parsed.data.meetingId}`)
  return { success: true as const }
}

export async function convertActionItemToTask(actionItemId: string) {
  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const { data: item } = await supabase
    .from("meeting_action_items")
    .select("*, meeting:meetings(id, title, sector_id, topic_id)")
    .eq("id", actionItemId)
    .single()
  if (!item) return { error: "Action item not found" }

  const meeting = item.meeting as unknown as {
    id: string
    title: string
    sector_id: string | null
    topic_id: string | null
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      sector_id: meeting.sector_id,
      topic_id: meeting.topic_id,
      title: item.description,
      description: `From meeting: ${meeting.title}`,
      priority: "medium",
      status: "not_started",
      start_date: new Date().toISOString().slice(0, 10),
      created_by: userId,
    })
    .select()
    .single()
  if (error) return { error: error.message }

  if (item.assignee_id) {
    await supabase
      .from("task_assignees")
      .insert({ task_id: task.id, user_id: item.assignee_id })
  }

  await supabase.from("task_activity").insert({
    task_id: task.id,
    actor_id: userId,
    action: "created",
    to_value: `Converted from meeting "${meeting.title}"`,
  })

  await supabase
    .from("meeting_action_items")
    .update({ converted_task_id: task.id })
    .eq("id", actionItemId)

  revalidatePath(`/meetings/${meeting.id}`)
  revalidatePath("/tasks")
  return { success: true as const, taskId: task.id as string }
}

export async function uploadMeetingAttachment(formData: FormData) {
  const meetingId = formData.get("meetingId") as string
  const file = formData.get("file") as File
  if (!file || file.size === 0) return { error: "No file selected" }

  const supabase = await createClient()
  const userId = await currentUserId(supabase)

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const path = `meetings/${meetingId}/${crypto.randomUUID()}-${safeName}`
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
    meeting_id: meetingId,
  })
  if (error) return { error: error.message }

  revalidatePath(`/meetings/${meetingId}`)
  return { success: true as const }
}
