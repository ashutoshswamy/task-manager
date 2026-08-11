"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, isPast } from "date-fns"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge, PriorityBadge } from "@/components/tasks/badges"
import { bulkUpdateStatus, bulkSetArchived } from "@/lib/actions/tasks"
import { STATUS_LABELS } from "@/lib/constants"

type TaskRow = {
  id: string
  title: string
  status: string
  priority: string
  deadline: string | null
  sector: { name: string } | null
  topic: { name: string } | null
  task_assignees: { user: { id: string; full_name: string } }[]
}

export function TaskTable({
  tasks,
  showBulkActions = true,
}: {
  tasks: TaskRow[]
  showBulkActions?: boolean
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((v) => v !== id) : [...s, id]
    )
  }

  function toggleAll() {
    setSelected(selected.length === tasks.length ? [] : tasks.map((t) => t.id))
  }

  function applyBulkStatus(status: string) {
    startTransition(async () => {
      const result = await bulkUpdateStatus(selected, status)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success(`Updated ${selected.length} task(s)`)
        setSelected([])
        router.refresh()
      }
    })
  }

  function archiveSelected() {
    startTransition(async () => {
      const result = await bulkSetArchived(selected, true)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success(`Archived ${selected.length} task(s)`)
        setSelected([])
        router.refresh()
      }
    })
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No tasks found.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {showBulkActions && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-sm">{selected.length} selected</span>
          <Select
            items={STATUS_LABELS}
            onValueChange={(v: string | null) => v && applyBulkStatus(v)}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 w-44">
              <SelectValue placeholder="Set status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={archiveSelected}
          >
            Archive
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {showBulkActions && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.length === tasks.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
              )}
              <TableHead>Task</TableHead>
              <TableHead>Sector / Topic</TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const overdue =
                task.deadline &&
                isPast(new Date(task.deadline)) &&
                task.status !== "completed"
              return (
                <TableRow key={task.id}>
                  {showBulkActions && (
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(task.id)}
                        onCheckedChange={() => toggle(task.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium hover:underline"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.sector?.name ?? "—"}
                    {task.topic ? ` / ${task.topic.name}` : ""}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.task_assignees.length
                      ? task.task_assignees
                          .map((a) => a.user?.full_name)
                          .join(", ")
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        overdue
                          ? "flex items-center gap-1 text-sm font-medium text-destructive"
                          : "text-sm text-muted-foreground"
                      }
                    >
                      {overdue && <AlertTriangle className="size-3.5" />}
                      {task.deadline
                        ? format(new Date(task.deadline), "MMM d, yyyy")
                        : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
