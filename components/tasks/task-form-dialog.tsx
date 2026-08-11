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
import { TaskForm } from "@/components/tasks/task-form"
import type { TaskInput } from "@/lib/validations/task"

type Sector = { id: string; name: string }
type Topic = { id: string; sector_id: string; name: string }
type Profile = { id: string; full_name: string }

export function TaskFormDialog({
  taskId,
  defaultValues,
  sectors,
  topics,
  profiles,
}: {
  taskId?: string
  defaultValues?: Partial<TaskInput>
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
          taskId ? (
            <Button variant="outline" size="sm">
              <Pencil className="size-4" />
              Edit
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="size-4" />
              New Task
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{taskId ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <TaskForm
          taskId={taskId}
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
