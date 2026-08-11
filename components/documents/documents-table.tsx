"use client"

import { useTransition } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { Download, Trash2, File } from "lucide-react"
import { formatFileSize } from "@/lib/format"
import { getSignedUrl, deleteDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DocumentRow } from "@/lib/queries/documents"

export function DocumentsTable({
  documents,
  currentUserId,
  isAdmin,
}: {
  documents: DocumentRow[]
  currentUserId: string
  isAdmin: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function download(doc: DocumentRow) {
    startTransition(async () => {
      const result = await getSignedUrl(doc.storage_path)
      if ("error" in result) toast.error(result.error)
      else window.open(result.url, "_blank")
    })
  }

  function remove(doc: DocumentRow) {
    startTransition(async () => {
      const result = await deleteDocument(doc.id, doc.storage_path)
      if ("error" in result) toast.error(result.error)
      else toast.success("Deleted")
    })
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No documents found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Linked to</TableHead>
            <TableHead>Uploaded by</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="flex items-center gap-2">
                <File className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{doc.filename}</span>
              </TableCell>
              <TableCell className="text-sm">
                {doc.task ? (
                  <Link href={`/tasks/${doc.task.id}`} className="hover:underline">
                    {doc.task.title}
                  </Link>
                ) : doc.meeting ? (
                  <Link
                    href={`/meetings/${doc.meeting.id}`}
                    className="hover:underline"
                  >
                    {doc.meeting.title}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {doc.uploader?.full_name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(doc.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatFileSize(doc.size)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => download(doc)}
                  >
                    <Download className="size-4" />
                  </Button>
                  {(isAdmin || doc.uploaded_by === currentUserId) && (
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
