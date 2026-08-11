import { notFound } from "next/navigation"
import { format } from "date-fns"
import {
  getMeetingById,
  getMeetingActionItems,
  getMeetingAttachments,
} from "@/lib/queries/meetings"
import { getSectors, getTopics, getProfiles } from "@/lib/queries/lookups"
import { requireUser } from "@/lib/auth/current-user"
import { MeetingFormDialog } from "@/components/meetings/meeting-form-dialog"
import { MeetingNotesForm } from "@/components/meetings/meeting-notes-form"
import { ActionItemsSection } from "@/components/meetings/action-items-section"
import { MeetingAttachmentUploadForm } from "@/components/meetings/meeting-attachment-upload-form"
import { AttachmentList } from "@/components/documents/attachment-list"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()
  const meeting = await getMeetingById(id)
  if (!meeting) notFound()

  const [actionItems, attachments, sectors, topics, profiles] =
    await Promise.all([
      getMeetingActionItems(id),
      getMeetingAttachments(id),
      getSectors(),
      getTopics(),
      getProfiles(),
    ])

  const participants: { id: string; full_name: string }[] =
    meeting.meeting_participants.map(
      (p: { user: { id: string; full_name: string } }) => p.user
    )

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold">{meeting.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {meeting.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(meeting.date), "MMM d, yyyy")} ·{" "}
              {meeting.start_time.slice(0, 5)}–{meeting.end_time.slice(0, 5)}
            </span>
          </div>
        </div>
        <MeetingFormDialog
          meetingId={meeting.id}
          defaultValues={{
            title: meeting.title,
            description: meeting.description ?? "",
            date: meeting.date,
            startTime: meeting.start_time,
            endTime: meeting.end_time,
            location: meeting.location ?? "",
            meetingLink: meeting.meeting_link ?? "",
            sectorId: meeting.sector_id,
            topicId: meeting.topic_id,
            agenda: meeting.agenda ?? "",
            participantIds: participants.map((p) => p.id),
            recurrence: { type: "none", interval: 1 },
          }}
          sectors={sectors}
          topics={topics}
          profiles={profiles}
        />
      </div>

      <Card className="grid grid-cols-2 gap-4 p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Organizer</p>
          <p>{meeting.organizer?.full_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Location</p>
          <p>{meeting.location || "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Link</p>
          <p className="truncate">
            {meeting.meeting_link ? (
              <a
                href={meeting.meeting_link}
                target="_blank"
                className="text-primary hover:underline"
              >
                Join
              </a>
            ) : (
              "—"
            )}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Sector / Topic</p>
          <p>
            {meeting.sector?.name ?? "—"}
            {meeting.topic ? ` / ${meeting.topic.name}` : ""}
          </p>
        </div>
        <div className="col-span-full">
          <p className="text-muted-foreground">Participants</p>
          <p>
            {participants.length
              ? participants.map((p) => p.full_name).join(", ")
              : "None"}
          </p>
        </div>
        {meeting.description && (
          <div className="col-span-full">
            <p className="text-muted-foreground">Description</p>
            <p className="whitespace-pre-wrap">{meeting.description}</p>
          </div>
        )}
        {meeting.agenda && (
          <div className="col-span-full">
            <p className="text-muted-foreground">Agenda</p>
            <p className="whitespace-pre-wrap">{meeting.agenda}</p>
          </div>
        )}
      </Card>

      <Tabs defaultValue="action-items">
        <TabsList>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
          <TabsTrigger value="notes">Notes &amp; Decisions</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>
        <TabsContent value="action-items">
          <ActionItemsSection
            meetingId={meeting.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={actionItems as any}
            profiles={profiles}
          />
        </TabsContent>
        <TabsContent value="notes">
          <MeetingNotesForm
            meetingId={meeting.id}
            notes={meeting.notes}
            decisions={meeting.decisions}
            status={meeting.status}
          />
        </TabsContent>
        <TabsContent value="attachments" className="grid gap-3">
          <MeetingAttachmentUploadForm meetingId={meeting.id} />
          <AttachmentList
            documents={attachments}
            currentUserId={user.id}
            canDelete={user.role === "admin"}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
