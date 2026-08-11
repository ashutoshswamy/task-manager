"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { addComment } from "@/lib/actions/tasks"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Comment = {
  id: string
  body: string
  created_at: string
  author: { full_name: string } | null
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function CommentSection({
  taskId,
  comments,
}: {
  taskId: string
  comments: Comment[]
}) {
  const [body, setBody] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function submit() {
    if (!body.trim()) return
    startTransition(async () => {
      const result = await addComment({ taskId, body })
      if ("error" in result) toast.error(result.error)
      else {
        setBody("")
        router.refresh()
      }
    })
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Textarea
          placeholder="Add a comment or update..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
        />
        <Button
          size="sm"
          className="justify-self-end"
          disabled={isPending || !body.trim()}
          onClick={submit}
        >
          {isPending ? "Posting..." : "Post comment"}
        </Button>
      </div>

      <div className="grid gap-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">
                {initials(c.author?.full_name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">
                  {c.author?.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
