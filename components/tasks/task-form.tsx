"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { taskSchema, type TaskInput } from "@/lib/validations/task"
import { createTask, updateTask } from "@/lib/actions/tasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SectorTopicFields } from "@/components/tasks/sector-topic-fields"
import { AssigneePicker } from "@/components/tasks/assignee-picker"
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants"

type Sector = { id: string; name: string }
type Topic = { id: string; sector_id: string; name: string }
type Profile = { id: string; full_name: string }

export function TaskForm({
  taskId,
  defaultValues,
  sectors,
  topics,
  profiles,
  onSuccess,
}: {
  taskId?: string
  defaultValues?: Partial<TaskInput>
  sectors: Sector[]
  topics: Topic[]
  profiles: Profile[]
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      sectorId: null,
      topicId: null,
      title: "",
      description: "",
      priority: "medium",
      status: "not_started",
      startDate: new Date().toISOString().slice(0, 10),
      deadline: "",
      nextAction: "",
      nextFollowUpDate: "",
      remarks: "",
      assigneeIds: [],
      ...defaultValues,
    },
  })

  function onSubmit(values: TaskInput) {
    startTransition(async () => {
      const result = taskId
        ? await updateTask(taskId, values)
        : await createTask(values)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success(taskId ? "Task updated" : "Task created")
      onSuccess()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task / Activity</FormLabel>
              <FormControl>
                <Input placeholder="What needs to be done?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SectorTopicFields
          sectors={sectors}
          topics={topics}
          sectorId={form.watch("sectorId")}
          topicId={form.watch("topicId")}
          onSectorChange={(id) => form.setValue("sectorId", id)}
          onTopicChange={(id) => form.setValue("topicId", id)}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  items={PRIORITY_LABELS}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  items={STATUS_LABELS}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline (optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Assigned To</FormLabel>
          <AssigneePicker
            profiles={profiles}
            value={form.watch("assigneeIds")}
            onChange={(ids) => form.setValue("assigneeIds", ids)}
          />
        </FormItem>

        <FormField
          control={form.control}
          name="nextAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next action</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nextFollowUpDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next follow-up date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="justify-self-end">
          {isPending ? "Saving..." : taskId ? "Save changes" : "Create task"}
        </Button>
      </form>
    </Form>
  )
}
