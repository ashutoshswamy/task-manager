import { Card } from "@/components/ui/card"

export function WidgetCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="grid gap-3 p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </Card>
  )
}

export function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>
}
