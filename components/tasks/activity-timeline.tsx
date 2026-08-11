import { formatDistanceToNow } from "date-fns"

type Activity = {
  id: string
  action: string
  from_value: string | null
  to_value: string | null
  created_at: string
  actor: { full_name: string } | null
}

const actionLabels: Record<string, (a: Activity) => string> = {
  created: (a) => `${a.actor?.full_name} created this task`,
  status_change: (a) =>
    `${a.actor?.full_name} changed status${a.from_value ? ` from ${a.from_value}` : ""} to ${a.to_value}`,
  priority_change: (a) =>
    `${a.actor?.full_name} changed priority${a.from_value ? ` from ${a.from_value}` : ""} to ${a.to_value}`,
  reassigned: (a) => `${a.actor?.full_name} reassigned this task`,
  comment: (a) => `${a.actor?.full_name} commented`,
  attachment: (a) => `${a.actor?.full_name} added an attachment`,
  follow_up: (a) => `${a.actor?.full_name} scheduled a follow-up`,
  updated: (a) => `${a.actor?.full_name} updated this task`,
  archived: (a) =>
    `${a.actor?.full_name} ${a.to_value === "true" ? "archived" : "unarchived"} this task`,
}

export function ActivityTimeline({ activity }: { activity: Activity[] }) {
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <div className="grid gap-3">
      {activity.map((a) => (
        <div key={a.id} className="flex items-baseline gap-2 text-sm">
          <span className="text-muted-foreground">
            {(actionLabels[a.action] ?? (() => a.action))(a)}
          </span>
          <span className="text-xs text-muted-foreground">
            · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  )
}
