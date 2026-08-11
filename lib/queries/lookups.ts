import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function getSectors() {
  const supabase = await createClient()
  const { data } = await supabase.from("sectors").select("*").order("name")
  return data ?? []
}

export async function getTopics(sectorId?: string) {
  const supabase = await createClient()
  let query = supabase.from("topics").select("*").order("name")
  if (sectorId) query = query.eq("sector_id", sectorId)
  const { data } = await query
  return data ?? []
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("active", true)
    .order("full_name")
  return data ?? []
}
