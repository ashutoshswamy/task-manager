import "server-only"
import { createClient } from "@/lib/supabase/server"

export type DocumentRow = {
  id: string
  filename: string
  size: number
  mime_type: string
  storage_path: string
  uploaded_by: string
  created_at: string
  uploader: { full_name: string } | null
  task: { id: string; title: string } | null
  meeting: { id: string; title: string } | null
}

export async function getAllDocuments(filters: { search?: string } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("documents")
    .select(
      "*, uploader:profiles(full_name), task:tasks(id, title), meeting:meetings(id, title)"
    )
    .order("created_at", { ascending: false })

  if (filters.search) query = query.ilike("filename", `%${filters.search}%`)

  const { data } = await query
  return (data ?? []) as unknown as DocumentRow[]
}
