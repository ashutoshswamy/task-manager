"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants"

type Sector = { id: string; name: string }

export function TaskFilters({ sectors }: { sectors: Sector[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Search tasks..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => setParam("search", e.target.value || null)}
        className="w-56"
      />
      <Select
        items={{ all: "Status", ...STATUS_LABELS }}
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => setParam("status", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status</SelectItem>
          <SelectItem value="not_started">Not Started</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select
        items={{ all: "Priority", ...PRIORITY_LABELS }}
        value={searchParams.get("priority") ?? "all"}
        onValueChange={(v) => setParam("priority", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Priority</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Select
        items={{
          all: "Sector",
          ...Object.fromEntries(sectors.map((s) => [s.id, s.name])),
        }}
        value={searchParams.get("sectorId") ?? "all"}
        onValueChange={(v) => setParam("sectorId", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sector" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sector</SelectItem>
          {sectors.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
