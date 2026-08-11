"use client"

import { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { createSector, createTopic } from "@/lib/actions/lookups"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Sector = { id: string; name: string }
type Topic = { id: string; sector_id: string; name: string }

export function SectorTopicFields({
  sectors: initialSectors,
  topics: initialTopics,
  sectorId,
  topicId,
  onSectorChange,
  onTopicChange,
}: {
  sectors: Sector[]
  topics: Topic[]
  sectorId: string | null
  topicId: string | null
  onSectorChange: (id: string | null) => void
  onTopicChange: (id: string | null) => void
}) {
  const [sectors, setSectors] = useState(initialSectors)
  const [topics, setTopics] = useState(initialTopics)
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false)
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [isPending, startTransition] = useTransition()

  const availableTopics = topics.filter((t) => t.sector_id === sectorId)

  function handleCreateSector() {
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await createSector({ name: newName })
      if ("sector" in result && result.sector) {
        setSectors((s) => [...s, result.sector].sort((a, b) => a.name.localeCompare(b.name)))
        onSectorChange(result.sector.id)
        setNewName("")
        setSectorDialogOpen(false)
      }
    })
  }

  function handleCreateTopic() {
    if (!newName.trim() || !sectorId) return
    startTransition(async () => {
      const result = await createTopic({ sectorId, name: newName })
      if ("topic" in result && result.topic) {
        setTopics((t) => [...t, result.topic])
        onTopicChange(result.topic.id)
        setNewName("")
        setTopicDialogOpen(false)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Sector</label>
        <div className="flex gap-1.5">
          <Select
            items={Object.fromEntries(sectors.map((s) => [s.id, s.name]))}
            value={sectorId ?? ""}
            onValueChange={(v) => {
              onSectorChange(v || null)
              onTopicChange(null)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setSectorDialogOpen(true)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Topic</label>
        <div className="flex gap-1.5">
          <Select
            items={Object.fromEntries(availableTopics.map((t) => [t.id, t.name]))}
            value={topicId ?? ""}
            onValueChange={(v) => onTopicChange(v || null)}
            disabled={!sectorId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {availableTopics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!sectorId}
            onClick={() => setTopicDialogOpen(true)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={sectorDialogOpen} onOpenChange={setSectorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New sector</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Sector name"
            autoFocus
          />
          <DialogFooter>
            <Button disabled={isPending} onClick={handleCreateSector}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New topic</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Topic name"
            autoFocus
          />
          <DialogFooter>
            <Button disabled={isPending} onClick={handleCreateTopic}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
