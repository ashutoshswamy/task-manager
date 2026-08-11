import { UserIcon } from "lucide-react"
import { getNotifications } from "@/lib/queries/notifications"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { LogoutMenuItem } from "@/components/layout/logout-menu-item"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { CommandMenu } from "@/components/search/command-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export async function Topbar({
  user,
}: {
  user: {
    id: string
    full_name: string
    email: string
    role: string
    avatar_url: string | null
  }
}) {
  const notifications = await getNotifications(user.id)

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
      <MobileSidebar />
      <CommandMenu />
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell userId={user.id} initialNotifications={notifications} />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="gap-2 px-2" />}
          >
            <Avatar className="size-7">
              {user.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
              )}
              <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {user.full_name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium">{user.full_name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<a href="/settings" />}>
              <UserIcon className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
