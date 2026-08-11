"use client"

import { useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Upload } from "lucide-react"
import { uploadMeetingAttachment } from "@/lib/actions/meetings"
import { Button } from "@/components/ui/button"

export function MeetingAttachmentUploadForm({
  meetingId,
}: {
  meetingId: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.set("meetingId", meetingId)
    formData.set("file", file)
    startTransition(async () => {
      const result = await uploadMeetingAttachment(formData)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success("File uploaded")
        router.refresh()
      }
      if (inputRef.current) inputRef.current.value = ""
    })
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-4" />
        {isPending ? "Uploading..." : "Upload file"}
      </Button>
    </div>
  )
}
