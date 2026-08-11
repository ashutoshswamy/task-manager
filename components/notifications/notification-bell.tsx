"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { NotificationRow } from "@/lib/queries/notifications"

export function NotificationBell({
  userId,
  initialNotifications,
}: {
  userId: string
  initialNotifications: NotificationRow[]
}) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new as NotificationRow,
            ...prev,
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  function open(n: NotificationRow) {
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((p) => (p.id === n.id ? { ...p, read: true } : p))
      )
      startTransition(() => {
        void markNotificationRead(n.id)
      })
    }
    if (n.link) router.push(n.link)
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(() => {
      void markAllNotificationsRead()
    })
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
            {unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[90vw] max-w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={`flex w-full flex-col items-start gap-0.5 border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-muted/50 ${
                  n.read ? "" : "bg-muted/30"
                }`}
              >
                <span className="font-medium">{n.title}</span>
                {n.body && (
                  <span className="text-xs text-muted-foreground">
                    {n.body}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
