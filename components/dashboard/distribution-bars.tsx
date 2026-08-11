import { Card } from "@/components/ui/card"

const COLORS = [
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-red-500",
]

export function DistributionBars({
  title,
  data,
}: {
  title: string
  data: { name: string; value: number }[]
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  return (
    <Card className="grid gap-3 p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid gap-2">
        {data.map((d, i) => (
          <div key={d.name} className="grid gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-medium">{d.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${COLORS[i % COLORS.length]}`}
                style={{ width: `${(d.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
