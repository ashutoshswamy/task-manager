"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateMeetingNotes } from "@/lib/actions/meetings"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MEETING_STATUS_LABELS } from "@/lib/constants"

export function MeetingNotesForm({
  meetingId,
  notes: initialNotes,
  decisions: initialDecisions,
  status: initialStatus,
}: {
  meetingId: string
  notes: string | null
  decisions: string | null
  status: string
}) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [decisions, setDecisions] = useState(initialDecisions ?? "")
  const [status, setStatus] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function save() {
    startTransition(async () => {
      const result = await updateMeetingNotes(meetingId, {
        notes,
        decisions,
        status: status as "scheduled" | "completed" | "cancelled",
      })
      if ("error" in result) toast.error(result.error)
      else {
        toast.success("Saved")
        router.refresh()
      }
    })
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Status</label>
        <Select
          items={MEETING_STATUS_LABELS}
          value={status}
          onValueChange={(v) => v && setStatus(v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Notes</label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Decisions</label>
        <Textarea
          rows={3}
          value={decisions}
          onChange={(e) => setDecisions(e.target.value)}
        />
      </div>
      <Button size="sm" disabled={isPending} onClick={save} className="justify-self-end">
        {isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  )
}
