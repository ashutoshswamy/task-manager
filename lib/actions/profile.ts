"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(input: { fullName: string }) {
  if (!input.fullName.trim()) return { error: "Name is required" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName })
    .eq("id", user.id)
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true as const }
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("file") as File
  if (!file || file.size === 0) return { error: "No file selected" }
  if (file.size > MAX_AVATAR_SIZE) return { error: "Image must be under 2MB" }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: "Use a PNG, JPEG, WEBP, or GIF image" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const ext = file.name.split(".").pop()
  const path = `${user.id}/avatar-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true })
  if (uploadError) return { error: uploadError.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path)

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)
  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  return { success: true as const, url: publicUrl }
}
