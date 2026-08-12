import { z } from "zod"

export const taskSchema = z.object({
  sectorId: z.string().uuid().nullable(),
  topicId: z.string().uuid().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["not_started", "in_progress", "on_hold", "completed"]),
  startDate: z.string().min(1, "Start date is required"),
  deadline: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  remarks: z.string().optional(),
  assigneeIds: z.array(z.string().uuid()),
  externalAssignee: z.string().optional(),
})
export type TaskInput = z.infer<typeof taskSchema>

export const commentSchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().min(1, "Comment can't be empty"),
})
export type CommentInput = z.infer<typeof commentSchema>

export const sectorSchema = z.object({
  name: z.string().min(1, "Sector name is required"),
})
export const topicSchema = z.object({
  sectorId: z.string().uuid(),
  name: z.string().min(1, "Topic name is required"),
})
