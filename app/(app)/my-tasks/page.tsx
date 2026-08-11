import { requireUser } from "@/lib/auth/current-user"
import { getMyTasks } from "@/lib/queries/tasks"
import { TaskTable } from "@/components/tasks/task-table"

export default async function MyTasksPage() {
  const user = await requireUser()
  const tasks = await getMyTasks(user.id)

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">My Tasks</h1>
      <TaskTable tasks={tasks} />
    </div>
  )
}
