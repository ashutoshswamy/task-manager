import { UpdatePasswordForm } from "@/components/auth/update-password-form"
import { SessionFromUrl } from "@/components/auth/session-from-url"

export default function UpdatePasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a password for your account.
        </p>
      </div>
      <SessionFromUrl>
        <UpdatePasswordForm />
      </SessionFromUrl>
    </div>
  )
}
