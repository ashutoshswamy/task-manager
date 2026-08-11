"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { globalSearch, type SearchResult } from "@/lib/actions/search"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(async () => {
        setResults(await globalSearch(query))
      })
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  function select(result: SearchResult) {
    setOpen(false)
    setQuery("")
    router.push(result.href)
  }

  const groups = [...new Set(results.map((r) => r.group))]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-9 justify-start px-0 text-muted-foreground sm:w-56 sm:px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="ml-auto hidden text-xs sm:inline">⌘K</kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search tasks, meetings, people..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group} heading={group}>
                {results
                  .filter((r) => r.group === group)
                  .map((r) => (
                    <CommandItem
                      key={`${r.group}-${r.id}`}
                      value={`${r.group}-${r.id}-${r.label}`}
                      onSelect={() => select(r)}
                    >
                      <div className="grid">
                        <span>{r.label}</span>
                        {r.sublabel && (
                          <span className="text-xs text-muted-foreground">
                            {r.sublabel}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
