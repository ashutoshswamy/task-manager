"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
import {
  createSector,
  createTopic,
  deleteSector,
  deleteTopic,
} from "@/lib/actions/lookups"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Sector = { id: string; name: string }
type Topic = { id: string; sector_id: string; name: string }

export function SectorsTopicsManager({
  sectors,
  topics,
}: {
  sectors: Sector[]
  topics: Topic[]
}) {
  const [newSector, setNewSector] = useState("")
  const [newTopic, setNewTopic] = useState("")
  const [topicSectorId, setTopicSectorId] = useState<string | null>(
    sectors[0]?.id ?? null
  )
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function addSector() {
    if (!newSector.trim()) return
    startTransition(async () => {
      const result = await createSector({ name: newSector })
      if ("error" in result) toast.error(result.error)
      else {
        setNewSector("")
        router.refresh()
      }
    })
  }

  function addTopic() {
    if (!newTopic.trim() || !topicSectorId) return
    startTransition(async () => {
      const result = await createTopic({
        sectorId: topicSectorId,
        name: newTopic,
      })
      if ("error" in result) toast.error(result.error)
      else {
        setNewTopic("")
        router.refresh()
      }
    })
  }

  function removeSector(id: string) {
    startTransition(async () => {
      const result = await deleteSector(id)
      if ("error" in result) toast.error(result.error)
      else router.refresh()
    })
  }

  function removeTopic(id: string) {
    startTransition(async () => {
      const result = await deleteTopic(id)
      if ("error" in result) toast.error(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="grid gap-3 p-4">
        <h3 className="text-sm font-medium">Sectors</h3>
        <div className="grid gap-2">
          {sectors.map((s) => (
            <div key={s.id} className="flex min-w-0 items-center justify-between gap-2 text-sm">
              <span className="truncate">{s.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => removeSector(s.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSector}
            onChange={(e) => setNewSector(e.target.value)}
            placeholder="New sector"
          />
          <Button size="icon" disabled={isPending} onClick={addSector}>
            <Plus className="size-4" />
          </Button>
        </div>
      </Card>

      <Card className="grid gap-3 p-4">
        <h3 className="text-sm font-medium">Topics</h3>
        <div className="grid gap-2">
          {topics.map((t) => (
            <div key={t.id} className="flex min-w-0 items-center justify-between gap-2 text-sm">
              <span className="truncate">
                {t.name}{" "}
                <span className="text-xs text-muted-foreground">
                  ({sectors.find((s) => s.id === t.sector_id)?.name})
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => removeTopic(t.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Select
            items={Object.fromEntries(sectors.map((s) => [s.id, s.name]))}
            value={topicSectorId ?? ""}
            onValueChange={(v) => setTopicSectorId(v || null)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="New topic"
          />
          <Button size="icon" disabled={isPending} onClick={addTopic}>
            <Plus className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
