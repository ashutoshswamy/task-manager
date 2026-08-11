"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { File, Download, Trash2 } from "lucide-react"
import { formatFileSize } from "@/lib/format"
import { getSignedUrl, deleteDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"

type Doc = {
  id: string
  filename: string
  size: number
  storage_path: string
  uploaded_by: string
  uploader?: { full_name: string } | null
  created_at: string
}

export function AttachmentList({
  documents,
  currentUserId,
  canDelete,
}: {
  documents: Doc[]
  currentUserId: string
  canDelete?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function download(doc: Doc) {
    startTransition(async () => {
      const result = await getSignedUrl(doc.storage_path)
      if ("error" in result) toast.error(result.error)
      else window.open(result.url, "_blank")
    })
  }

  function remove(doc: Doc) {
    startTransition(async () => {
      const result = await deleteDocument(doc.id, doc.storage_path)
      if ("error" in result) toast.error(result.error)
      else toast.success("Deleted")
    })
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No attachments.</p>
  }

  return (
    <div className="grid gap-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 rounded-md border px-3 py-2"
        >
          <File className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{doc.filename}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(doc.size)}
              {doc.uploader ? ` · ${doc.uploader.full_name}` : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={() => download(doc)}
          >
            <Download className="size-4" />
          </Button>
          {(canDelete || doc.uploaded_by === currentUserId) && (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => remove(doc)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
