export type Role = "admin" | "manager" | "member"

export type Profile = {
  id: string
  full_name: string
  email: string
  role: Role
  department: string | null
  active: boolean
  avatar_url: string | null
  created_at: string
}
