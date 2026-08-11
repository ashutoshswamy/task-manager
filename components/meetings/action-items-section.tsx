"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRightCircle, Plus } from "lucide-react"
import { addActionItem, convertActionItemToTask } from "@/lib/actions/meetings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

type Profile = { id: string; full_name: string }
type ActionItem = {
  id: string
  description: string
  assignee: { id: string; full_name: string } | null
  converted_task_id: string | null
}

export function ActionItemsSection({
  meetingId,
  items,
  profiles,
}: {
  meetingId: string
  items: ActionItem[]
  profiles: Profile[]
}) {
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function submit() {
    if (!description.trim()) return
    startTransition(async () => {
      const result = await addActionItem({
        meetingId,
        description,
        assigneeId,
      })
      if ("error" in result) toast.error(result.error)
      else {
        setDescription("")
        setAssigneeId(null)
        router.refresh()
      }
    })
  }

  function convert(id: string) {
    startTransition(async () => {
      const result = await convertActionItemToTask(id)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success("Converted to task")
        router.refresh()
      }
    })
  }

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No action items yet.</p>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between gap-2 p-3">
            <div>
              <p className="text-sm">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                {item.assignee?.full_name ?? "Unassigned"}
              </p>
            </div>
            {item.converted_task_id ? (
              <span className="text-xs text-muted-foreground">Converted</span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => convert(item.id)}
              >
                <ArrowRightCircle className="size-4" />
                Convert to task
              </Button>
            )}
          </Card>
        ))
      )}

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="New action item..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1"
        />
        <Select
          items={Object.fromEntries(profiles.map((p) => [p.id, p.full_name]))}
          value={assigneeId ?? ""}
          onValueChange={(v) => setAssigneeId(v || null)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button disabled={isPending} onClick={submit}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  )
}
