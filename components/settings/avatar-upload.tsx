"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Camera } from "lucide-react"
import { uploadAvatar } from "@/lib/actions/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AvatarUpload({
  fullName,
  avatarUrl,
}: {
  fullName: string
  avatarUrl: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(avatarUrl)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    const formData = new FormData()
    formData.set("file", file)
    startTransition(async () => {
      const result = await uploadAvatar(formData)
      if ("error" in result) {
        toast.error(result.error)
        setPreview(avatarUrl)
      } else {
        toast.success("Profile picture updated")
        router.refresh()
      }
      if (inputRef.current) inputRef.current.value = ""
    })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar size="lg">
          {preview && <AvatarImage src={preview} alt={fullName} />}
          <AvatarFallback>{initials(fullName)}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Camera className="size-3" />
        </button>
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
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
          {isPending ? "Uploading..." : "Change photo"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, WEBP or GIF. Max 2MB.</p>
      </div>
    </div>
  )
}
