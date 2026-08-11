"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Status = "checking" | "ready" | "error"

export function SessionFromUrl({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function resolveSession() {
      // Supabase's hosted verify link redirects here with the session in the
      // URL hash (#access_token=...&refresh_token=...) — hash fragments never
      // reach the server, so exchange them for a cookie-backed session here.
      const hash = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = hash.get("access_token")
      const refreshToken = hash.get("refresh_token")
      const hashError = hash.get("error_description")

      if (hashError) {
        setErrorMessage(hashError)
        setStatus("error")
        return
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        window.history.replaceState(null, "", window.location.pathname)
        if (error) {
          setErrorMessage(error.message)
          setStatus("error")
          return
        }
        setStatus("ready")
        return
      }

      // Some flows (PKCE) arrive with ?code= instead of a hash.
      const code = new URLSearchParams(window.location.search).get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState(null, "", window.location.pathname)
        if (error) {
          setErrorMessage(error.message)
          setStatus("error")
          return
        }
        setStatus("ready")
        return
      }

      // No tokens in the URL — maybe a session already exists (e.g. page refresh).
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setStatus(session ? "ready" : "error")
      if (!session) setErrorMessage("This link is invalid or has expired.")
    }

    resolveSession()
  }, [])

  if (status === "checking") {
    return <p className="text-sm text-muted-foreground">Verifying link...</p>
  }

  if (status === "error") {
    return (
      <p className="text-sm text-destructive">
        {errorMessage ?? "This link is invalid or has expired."} Ask an admin
        to reset your password.
      </p>
    )
  }

  return <>{children}</>
}
