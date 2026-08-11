"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Archive, ArchiveRestore } from "lucide-react"
import { setTaskArchived } from "@/lib/actions/tasks"
import { Button } from "@/components/ui/button"

export function ArchiveButton({
  taskId,
  archived,
}: {
  taskId: string
  archived: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle() {
    startTransition(async () => {
      const result = await setTaskArchived(taskId, !archived)
      if ("error" in result) toast.error(result.error)
      else {
        toast.success(archived ? "Task restored" : "Task archived")
        router.refresh()
      }
    })
  }

  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={toggle}>
      {archived ? (
        <ArchiveRestore className="size-4" />
      ) : (
        <Archive className="size-4" />
      )}
      {archived ? "Restore" : "Archive"}
    </Button>
  )
}
