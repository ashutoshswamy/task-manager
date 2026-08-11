"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getSignedUrl(storagePath: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(storagePath, 60 * 5)
  if (error) return { error: error.message }
  return { success: true as const, url: data.signedUrl }
}

export async function deleteDocument(id: string, storagePath: string) {
  const supabase = await createClient()
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([storagePath])
  if (storageError) return { error: storageError.message }

  const { error } = await supabase.from("documents").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/documents")
  return { success: true as const }
}
