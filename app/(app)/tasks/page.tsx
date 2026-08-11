import { getTasks } from "@/lib/queries/tasks"
import { getSectors, getTopics, getProfiles } from "@/lib/queries/lookups"
import { TaskFilters } from "@/components/tasks/task-filters"
import { TaskTable } from "@/components/tasks/task-table"
import { TaskFormDialog } from "@/components/tasks/task-form-dialog"

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    priority?: string
    sectorId?: string
    search?: string
  }>
}) {
  const params = await searchParams
  const [tasks, sectors, topics, profiles] = await Promise.all([
    getTasks(params),
    getSectors(),
    getTopics(),
    getProfiles(),
  ])

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <TaskFormDialog sectors={sectors} topics={topics} profiles={profiles} />
      </div>
      <TaskFilters sectors={sectors} />
      <TaskTable tasks={tasks} />
    </div>
  )
}
