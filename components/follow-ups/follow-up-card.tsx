"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { Check, CalendarClock, MessageSquarePlus, ExternalLink } from "lucide-react"
import {
  completeFollowUp,
  rescheduleFollowUp,
  addFollowUpUpdate,
} from "@/lib/actions/follow-ups"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { FollowUpRow } from "@/lib/queries/follow-ups"

export function FollowUpCard({ followUp }: { followUp: FollowUpRow }) {
  const [isPending, startTransition] = useTransition()
  const [newDate, setNewDate] = useState(followUp.due_date)
  const [note, setNote] = useState(followUp.note ?? "")
  const router = useRouter()

  function complete() {
    startTransition(async () => {
      const result = await completeFollowUp(followUp.id)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success("Follow-up completed")
        router.refresh()
      }
    })
  }

  function reschedule() {
    startTransition(async () => {
      const result = await rescheduleFollowUp(followUp.id, newDate)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success("Rescheduled")
        router.refresh()
      }
    })
  }

  function saveNote() {
    startTransition(async () => {
      const result = await addFollowUpUpdate(followUp.id, note)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success("Update saved")
        router.refresh()
      }
    })
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <Link
          href={`/tasks/${followUp.task_id}`}
          className="font-medium hover:underline"
        >
          {followUp.task?.title}
        </Link>
        <p className="text-xs text-muted-foreground">
          Due {format(new Date(followUp.due_date), "MMM d, yyyy")}
          {followUp.note ? ` · ${followUp.note}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={isPending}
          onClick={complete}
          title="Complete"
        >
          <Check className="size-4" />
        </Button>
        <Popover>
          <PopoverTrigger
            render={<Button size="icon-sm" variant="ghost" title="Reschedule" />}
          >
            <CalendarClock className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="grid w-56 gap-2">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <Button size="sm" disabled={isPending} onClick={reschedule}>
              Save
            </Button>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger
            render={<Button size="icon-sm" variant="ghost" title="Add update" />}
          >
            <MessageSquarePlus className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="grid w-64 gap-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add a note..."
            />
            <Button size="sm" disabled={isPending} onClick={saveNote}>
              Save
            </Button>
          </PopoverContent>
        </Popover>
        <Button size="icon-sm" variant="ghost" render={<Link href={`/tasks/${followUp.task_id}`} title="Open task" />}>
          <ExternalLink className="size-4" />
        </Button>
      </div>
    </Card>
  )
}
