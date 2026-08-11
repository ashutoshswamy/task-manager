"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  loginSchema,
  updatePasswordSchema,
  addMemberSchema,
  type LoginInput,
  type UpdatePasswordInput,
  type AddMemberInput,
} from "@/lib/validations/auth"

export type ActionResult = { error: string } | { success: true }

export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: error.message }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function updatePassword(
  input: UpdatePasswordInput
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) return { error: error.message }

  await supabase
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id)

  redirect("/dashboard")
}

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
  return user
}

export async function addMember(input: AddMemberInput): Promise<ActionResult> {
  const parsed = addMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await requireAdmin()

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      department: parsed.data.department ?? null,
    },
  })
  if (error) return { error: error.message }

  revalidatePath("/team")
  return { success: true }
}
