"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MeetingForm } from "@/components/meetings/meeting-form"
import type { MeetingInput } from "@/lib/validations/meeting"

type Sector = { id: string; name: string }
type Topic = { id: string; sector_id: string; name: string }
type Profile = { id: string; full_name: string }

export function MeetingFormDialog({
  meetingId,
  defaultValues,
  sectors,
  topics,
  profiles,
}: {
  meetingId?: string
  defaultValues?: Partial<MeetingInput>
  sectors: Sector[]
  topics: Topic[]
  profiles: Profile[]
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          meetingId ? (
            <Button variant="outline" size="sm">
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="size-4" />
              New Meeting
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{meetingId ? "Edit meeting" : "New meeting"}</DialogTitle>
        </DialogHeader>
        <MeetingForm
          meetingId={meetingId}
          defaultValues={defaultValues}
          sectors={sectors}
          topics={topics}
          profiles={profiles}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
