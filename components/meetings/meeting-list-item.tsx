import Link from "next/link"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Meeting = {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  status: string
  sector: { name: string } | null
  organizer: { full_name: string } | null
}

export function MeetingListItem({ meeting }: { meeting: Meeting }) {
  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="flex flex-wrap items-center justify-between gap-2 p-3 transition-colors hover:bg-muted/40">
        <div>
          <p className="font-medium">{meeting.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(meeting.date), "MMM d, yyyy")} ·{" "}
            {meeting.start_time.slice(0, 5)}–{meeting.end_time.slice(0, 5)}
            {meeting.sector ? ` · ${meeting.sector.name}` : ""}
            {meeting.organizer ? ` · organized by ${meeting.organizer.full_name}` : ""}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {meeting.status}
        </Badge>
      </Card>
    </Link>
  )
}
