"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { sectorSchema, topicSchema } from "@/lib/validations/task"

export async function createSector(input: { name: string }) {
  const parsed = sectorSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sectors")
    .insert({ name: parsed.data.name })
    .select()
    .single()
  if (error) return { error: error.message }

  revalidatePath("/tasks")
  return { success: true as const, sector: data }
}

export async function deleteSector(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("sectors").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/settings")
  return { success: true as const }
}

export async function deleteTopic(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("topics").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/settings")
  return { success: true as const }
}

export async function createTopic(input: { sectorId: string; name: string }) {
  const parsed = topicSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("topics")
    .insert({ sector_id: parsed.data.sectorId, name: parsed.data.name })
    .select()
    .single()
  if (error) return { error: error.message }

  revalidatePath("/tasks")
  return { success: true as const, topic: data }
}
