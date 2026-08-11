"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/actions/auth"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function LogoutMenuItem() {
  const [isPending, startTransition] = useTransition()

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
    >
      <LogOut className="size-4" />
      Log out
    </DropdownMenuItem>
  )
}
