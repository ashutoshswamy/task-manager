"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MeetingViewTabs({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setView(view: string | null) {
    if (!view) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", view)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={current} onValueChange={setView}>
      <TabsList>
        <TabsTrigger value="day">Daily</TabsTrigger>
        <TabsTrigger value="week">Weekly</TabsTrigger>
        <TabsTrigger value="month">Monthly</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
