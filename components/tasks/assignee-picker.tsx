"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type Profile = { id: string; full_name: string }

export function AssigneePicker({
  profiles,
  value,
  onChange,
}: {
  profiles: Profile[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  function toggle(id: string) {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    )
  }

  const selected = profiles.filter((p) => value.includes(p.id))

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className="truncate">
          {selected.length
            ? selected.map((p) => p.full_name).join(", ")
            : "Select assignees"}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search people..." />
          <CommandList>
            <CommandEmpty>No one found.</CommandEmpty>
            <CommandGroup>
              {profiles.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.full_name}
                  onSelect={() => toggle(p.id)}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value.includes(p.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {p.full_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
