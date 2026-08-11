"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { updateUserRole, setUserActive } from "@/lib/actions/team"
import { ResetPasswordDialog } from "@/components/team/reset-password-dialog"
import { DeleteMemberDialog } from "@/components/team/delete-member-dialog"
import type { TeamMember } from "@/lib/queries/team"
import { ROLE_LABELS } from "@/lib/constants"

export function TeamTable({
  members,
  isAdmin,
  currentUserId,
}: {
  members: TeamMember[]
  isAdmin: boolean
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function changeRole(userId: string, role: string) {
    startTransition(async () => {
      const result = await updateUserRole(
        userId,
        role as "admin" | "manager" | "member"
      )
      if ("error" in result) toast.error(result.error)
      else router.refresh()
    })
  }

  function toggleActive(userId: string, active: boolean) {
    startTransition(async () => {
      const result = await setUserActive(userId, active)
      if ("error" in result) toast.error(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Overdue</TableHead>
            <TableHead>Follow-ups</TableHead>
            <TableHead>Active</TableHead>
            {isAdmin && <TableHead className="w-16" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => {
            const isSelf = m.id === currentUserId
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <p className="font-medium">
                    {m.full_name}
                    {isSelf && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.department ?? "—"}
                </TableCell>
                <TableCell>
                  {isAdmin && !isSelf ? (
                    <Select
                      items={ROLE_LABELS}
                      value={m.role}
                      onValueChange={(v) => v && changeRole(m.id, v)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-7 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Team Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {m.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{m.assigned}</TableCell>
                <TableCell>{m.completed}</TableCell>
                <TableCell className={m.overdue > 0 ? "text-destructive" : ""}>
                  {m.overdue}
                </TableCell>
                <TableCell>{m.followUps}</TableCell>
                <TableCell>
                  {isAdmin && !isSelf ? (
                    <Switch
                      checked={m.active}
                      onCheckedChange={(v) => toggleActive(m.id, !!v)}
                      disabled={isPending}
                    />
                  ) : (
                    <Badge variant={m.active ? "default" : "outline"}>
                      {m.active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {!isSelf && (
                      <div className="flex items-center gap-0.5">
                        {m.role !== "admin" && (
                          <ResetPasswordDialog userId={m.id} userName={m.full_name} />
                        )}
                        <DeleteMemberDialog userId={m.id} userName={m.full_name} />
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
