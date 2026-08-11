export type Role = "admin" | "manager" | "member"

export function isAdmin(role: Role) {
  return role === "admin"
}

export function isManagerOrAdmin(role: Role) {
  return role === "admin" || role === "manager"
}

export function canEditTask(
  role: Role,
  userId: string,
  task: { createdBy: string; assigneeIds: string[] }
) {
  return (
    isManagerOrAdmin(role) ||
    task.createdBy === userId ||
    task.assigneeIds.includes(userId)
  )
}

export function canDeleteTask(
  role: Role,
  userId: string,
  task: { createdBy: string }
) {
  return isManagerOrAdmin(role) || task.createdBy === userId
}

export function canManageUsers(role: Role) {
  return isAdmin(role)
}
