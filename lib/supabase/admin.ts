import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role client. Bypasses RLS entirely — only import from
 * server actions that have already checked the caller's role
 * (e.g. admin-only user invites). Never import in a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
