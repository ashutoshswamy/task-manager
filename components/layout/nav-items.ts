import {
  LayoutDashboard,
  ListTodo,
  UserCheck,
  BellRing,
  CalendarClock,
  CalendarDays,
  Users,
  FolderOpen,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: ListTodo },
  { title: "My Tasks", href: "/my-tasks", icon: UserCheck },
  { title: "Follow-ups", href: "/follow-ups", icon: BellRing },
  { title: "Meetings", href: "/meetings", icon: CalendarClock },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Team", href: "/team", icon: Users },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
]
