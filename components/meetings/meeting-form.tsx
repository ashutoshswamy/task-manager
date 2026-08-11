"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { meetingSchema, type MeetingInput } from "@/lib/validations/meeting"
import { createMeeting, updateMeeting } from "@/lib/actions/meetings"
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
import { RECURRENCE_LABELS } from "@/lib/constants"

type Sector = { id: string; name: string }
type Topic = { id: string; sector_id: string; name: string }
type Profile = { id: string; full_name: string }

export function MeetingForm({
  meetingId,
  defaultValues,
  sectors,
  topics,
  profiles,
  onSuccess,
}: {
  meetingId?: string
  defaultValues?: Partial<MeetingInput>
  sectors: Sector[]
  topics: Topic[]
  profiles: Profile[]
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<MeetingInput>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      startTime: "10:00",
      endTime: "11:00",
      location: "",
      meetingLink: "",
      sectorId: null,
      topicId: null,
      agenda: "",
      participantIds: [],
      recurrence: { type: "none", interval: 1 },
      ...defaultValues,
    },
  })

  function onSubmit(values: MeetingInput) {
    startTransition(async () => {
      const result = meetingId
        ? await updateMeeting(meetingId, values)
        : await createMeeting(values)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success(meetingId ? "Meeting updated" : "Meeting created")
      onSuccess()
    })
  }

  const recurrenceType = form.watch("recurrence.type")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting title</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting link</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <SectorTopicFields
          sectors={sectors}
          topics={topics}
          sectorId={form.watch("sectorId")}
          topicId={form.watch("topicId")}
          onSectorChange={(id) => form.setValue("sectorId", id)}
          onTopicChange={(id) => form.setValue("topicId", id)}
        />

        <FormItem>
          <FormLabel>Participants</FormLabel>
          <AssigneePicker
            profiles={profiles}
            value={form.watch("participantIds")}
            onChange={(ids) => form.setValue("participantIds", ids)}
          />
        </FormItem>

        <FormField
          control={form.control}
          name="agenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agenda</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!meetingId && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormItem>
              <FormLabel>Recurrence</FormLabel>
              <Select
                items={RECURRENCE_LABELS}
                value={recurrenceType}
                onValueChange={(v) =>
                  v && form.setValue("recurrence.type", v as "none" | "daily" | "weekly" | "monthly")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            {recurrenceType !== "none" && (
              <>
                <FormItem>
                  <FormLabel>Every</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    {...form.register("recurrence.interval", {
                      valueAsNumber: true,
                    })}
                  />
                </FormItem>
                <FormItem>
                  <FormLabel>Until</FormLabel>
                  <Input type="date" {...form.register("recurrence.endDate")} />
                </FormItem>
              </>
            )}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="justify-self-end">
          {isPending ? "Saving..." : meetingId ? "Save changes" : "Create meeting"}
        </Button>
      </form>
    </Form>
  )
}
