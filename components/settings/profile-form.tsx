"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/lib/actions/profile"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ProfileForm({
  fullName,
  email,
}: {
  fullName: string
  email: string
}) {
  const [name, setName] = useState(fullName)
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await updateProfile({ fullName: name })
      if ("error" in result) toast.error(result.error)
      else toast.success("Profile updated")
    })
  }

  return (
    <div className="grid max-w-sm gap-3">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Full name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Email</label>
        <Input value={email} disabled />
      </div>
      <Button size="sm" disabled={isPending} onClick={save} className="justify-self-end">
        {isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  )
}
