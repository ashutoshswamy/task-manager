import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your workspace.
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
