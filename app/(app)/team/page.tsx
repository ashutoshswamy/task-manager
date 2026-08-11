import { requireUser } from "@/lib/auth/current-user"
import { getTeamMembers } from "@/lib/queries/team"
import { TeamTable } from "@/components/team/team-table"
import { AddMemberDialog } from "@/components/team/add-member-dialog"

export default async function TeamPage() {
  const user = await requireUser()
  const members = await getTeamMembers()

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team</h1>
        {user.role === "admin" && <AddMemberDialog />}
      </div>
      <TeamTable
        members={members}
        isAdmin={user.role === "admin"}
        currentUserId={user.id}
      />
    </div>
  )
}
