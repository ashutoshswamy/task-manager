"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  adminResetPasswordSchema,
  type AdminResetPasswordInput,
} from "@/lib/validations/auth"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!profile || profile.role !== "admin") throw new Error("Forbidden")
  return { supabase, adminId: user.id }
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "manager" | "member"
) {
  const { supabase, adminId } = await requireAdmin()
  if (userId === adminId) {
    return { error: "You can't change your own role" }
  }

  const { error } = await supabase
    .from("profiles")
    .update(role === "admin" ? { role, must_change_password: false } : { role })
    .eq("id", userId)
  if (error) return { error: error.message }

  revalidatePath("/team")
  return { success: true as const }
}

export async function setUserActive(userId: string, active: boolean) {
  const { supabase, adminId } = await requireAdmin()
  if (userId === adminId) {
    return { error: "You can't change your own active status" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("id", userId)
  if (error) return { error: error.message }

  revalidatePath("/team")
  return { success: true as const }
}

export async function deleteMember(userId: string) {
  const { adminId } = await requireAdmin()
  if (userId === adminId) {
    return { error: "You can't delete your own account" }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    return {
      error: error.message.includes("foreign key")
        ? "Can't delete: this member has existing tasks, comments, or other records. Deactivate them instead."
        : error.message,
    }
  }

  revalidatePath("/team")
  return { success: true as const }
}

export async function adminResetPassword(
  userId: string,
  input: AdminResetPasswordInput
) {
  const { supabase, adminId } = await requireAdmin()
  if (userId === adminId) {
    return { error: "Use Settings to change your own password" }
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()
  if (target?.role === "admin") {
    return { error: "Admin passwords can't be reset here" }
  }

  const parsed = adminResetPasswordSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: parsed.data.password,
  })
  if (error) return { error: error.message }

  await supabase
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", userId)

  revalidatePath("/team")
  return { success: true as const }
}
