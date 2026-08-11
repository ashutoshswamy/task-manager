import { z } from "zod"

export const recurrenceSchema = z.object({
  type: z.enum(["none", "daily", "weekly", "monthly"]),
  interval: z.number().min(1),
  endDate: z.string().optional(),
})
export type RecurrenceInput = z.infer<typeof recurrenceSchema>

export const meetingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  sectorId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  agenda: z.string().optional(),
  participantIds: z.array(z.string().uuid()),
  recurrence: recurrenceSchema,
})
export type MeetingInput = z.infer<typeof meetingSchema>

export const meetingNotesSchema = z.object({
  notes: z.string().optional(),
  decisions: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]),
})
export type MeetingNotesInput = z.infer<typeof meetingNotesSchema>

export const actionItemSchema = z.object({
  meetingId: z.string().uuid(),
  description: z.string().min(1, "Description is required"),
  assigneeId: z.string().uuid().nullable(),
})
export type ActionItemInput = z.infer<typeof actionItemSchema>
