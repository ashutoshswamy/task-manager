"use server"

import { createClient } from "@/lib/supabase/server"

export type SearchResult = {
  id: string
  label: string
  sublabel?: string
  href: string
  group: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const supabase = await createClient()
  const like = `%${query}%`

  const [tasks, meetings, profiles, comments, sectors, topics, documents] =
    await Promise.all([
      supabase.from("tasks").select("id, title").ilike("title", like).limit(5),
      supabase.from("meetings").select("id, title").ilike("title", like).limit(5),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .ilike("full_name", like)
        .limit(5),
      supabase
        .from("task_comments")
        .select("id, body, task_id")
        .ilike("body", like)
        .limit(5),
      supabase.from("sectors").select("id, name").ilike("name", like).limit(5),
      supabase.from("topics").select("id, name").ilike("name", like).limit(5),
      supabase
        .from("documents")
        .select("id, filename")
        .ilike("filename", like)
        .limit(5),
    ])

  const results: SearchResult[] = []

  for (const t of tasks.data ?? [])
    results.push({ id: t.id, label: t.title, href: `/tasks/${t.id}`, group: "Tasks" })
  for (const m of meetings.data ?? [])
    results.push({
      id: m.id,
      label: m.title,
      href: `/meetings/${m.id}`,
      group: "Meetings",
    })
  for (const p of profiles.data ?? [])
    results.push({
      id: p.id,
      label: p.full_name,
      sublabel: p.email,
      href: `/team`,
      group: "People",
    })
  for (const c of comments.data ?? [])
    results.push({
      id: c.id,
      label: c.body.slice(0, 60),
      href: `/tasks/${c.task_id}`,
      group: "Comments",
    })
  for (const s of sectors.data ?? [])
    results.push({ id: s.id, label: s.name, href: `/tasks?sectorId=${s.id}`, group: "Sectors" })
  for (const t of topics.data ?? [])
    results.push({ id: t.id, label: t.name, href: `/tasks`, group: "Topics" })
  for (const d of documents.data ?? [])
    results.push({
      id: d.id,
      label: d.filename,
      href: `/documents`,
      group: "Documents",
    })

  return results
}
