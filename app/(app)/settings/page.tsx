import { requireUser } from "@/lib/auth/current-user"
import { getSectors, getTopics } from "@/lib/queries/lookups"
import { AvatarUpload } from "@/components/settings/avatar-upload"
import { ProfileForm } from "@/components/settings/profile-form"
import { SectorsTopicsManager } from "@/components/settings/sectors-topics-manager"

export default async function SettingsPage() {
  const user = await requireUser()
  const isManagerOrAdmin = user.role === "admin" || user.role === "manager"
  const [sectors, topics] = isManagerOrAdmin
    ? await Promise.all([getSectors(), getTopics()])
    : [[], []]

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <div className="grid gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Profile</h2>
        <AvatarUpload fullName={user.full_name} avatarUrl={user.avatar_url} />
        <ProfileForm fullName={user.full_name} email={user.email} />
      </div>

      {isManagerOrAdmin && (
        <div className="grid gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Sectors &amp; Topics
          </h2>
          <SectorsTopicsManager sectors={sectors} topics={topics} />
        </div>
      )}
    </div>
  )
}
