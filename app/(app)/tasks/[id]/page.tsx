import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
  getTaskById,
  getTaskComments,
  getTaskActivity,
  getTaskAttachments,
} from "@/lib/queries/tasks"
import { getSectors, getTopics, getProfiles } from "@/lib/queries/lookups"
import { requireUser } from "@/lib/auth/current-user"
import { StatusBadge, PriorityBadge } from "@/components/tasks/badges"
import { TaskFormDialog } from "@/components/tasks/task-form-dialog"
import { ArchiveButton } from "@/components/tasks/archive-button"
import { CommentSection } from "@/components/tasks/comment-section"
import { ActivityTimeline } from "@/components/tasks/activity-timeline"
import { AttachmentList } from "@/components/documents/attachment-list"
import { AttachmentUploadForm } from "@/components/tasks/attachment-upload-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const task = await getTaskById(id)
  if (!task) notFound()

  const [comments, activity, attachments, sectors, topics, profiles] =
    await Promise.all([
      getTaskComments(id),
      getTaskActivity(id),
      getTaskAttachments(id),
      getSectors(),
      getTopics(),
      getProfiles(),
    ])

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold">{task.title}</h1>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {task.sector && (
              <span className="text-sm text-muted-foreground">
                {task.sector.name}
                {task.topic ? ` / ${task.topic.name}` : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <TaskFormDialog
            taskId={task.id}
            defaultValues={{
              sectorId: task.sector_id,
              topicId: task.topic_id,
              title: task.title,
              description: task.description ?? "",
              priority: task.priority,
              status: task.status,
              startDate: task.start_date,
              deadline: task.deadline ?? "",
              nextAction: task.next_action ?? "",
              nextFollowUpDate: task.next_follow_up_date ?? "",
              remarks: task.remarks ?? "",
              assigneeIds: task.task_assignees.map(
                (a: { user: { id: string } }) => a.user.id
              ),
              externalAssignee: task.external_assignee ?? "",
            }}
            sectors={sectors}
            topics={topics}
            profiles={profiles}
          />
          <ArchiveButton taskId={task.id} archived={task.archived} />
        </div>
      </div>

      <Card className="grid grid-cols-2 gap-4 p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Assigned To</p>
          <p>
            {[
              ...task.task_assignees.map(
                (a: { user: { full_name: string } }) => a.user.full_name
              ),
              ...(task.external_assignee ? [task.external_assignee] : []),
            ].join(", ") || "Unassigned"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Start Date</p>
          <p>{format(new Date(task.start_date), "MMM d, yyyy")}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Deadline</p>
          <p>
            {task.deadline ? format(new Date(task.deadline), "MMM d, yyyy") : "—"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Next Follow-up</p>
          <p>
            {task.next_follow_up_date
              ? format(new Date(task.next_follow_up_date), "MMM d, yyyy")
              : "—"}
          </p>
        </div>
        {task.description && (
          <div className="col-span-full">
            <p className="text-muted-foreground">Description</p>
            <p className="whitespace-pre-wrap">{task.description}</p>
          </div>
        )}
        {task.next_action && (
          <div className="col-span-full">
            <p className="text-muted-foreground">Next Action</p>
            <p>{task.next_action}</p>
          </div>
        )}
        {task.remarks && (
          <div className="col-span-full">
            <p className="text-muted-foreground">Remarks</p>
            <p className="whitespace-pre-wrap">{task.remarks}</p>
          </div>
        )}
      </Card>

      <Tabs defaultValue="comments">
        <TabsList>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="comments">
          <CommentSection taskId={task.id} comments={comments} />
        </TabsContent>
        <TabsContent value="attachments" className="grid gap-3">
          <AttachmentUploadForm taskId={task.id} />
          <AttachmentList
            documents={attachments}
            currentUserId={user.id}
            canDelete={user.role === "admin"}
          />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTimeline activity={activity} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
