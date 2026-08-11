"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="grid place-items-center gap-3 py-20 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div>
        <p className="font-medium">Something went wrong</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
