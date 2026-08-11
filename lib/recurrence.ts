import { addDays, addMonths, addWeeks, format, parseISO } from "date-fns"
import type { RecurrenceInput } from "@/lib/validations/meeting"

const MAX_OCCURRENCES = 52
const DEFAULT_HORIZON_DAYS = 365

/** Returns the additional occurrence dates (excluding the original date) as YYYY-MM-DD strings. */
export function generateOccurrenceDates(
  startDate: string,
  recurrence: RecurrenceInput
): string[] {
  if (recurrence.type === "none") return []

  const start = parseISO(startDate)
  const horizon = recurrence.endDate
    ? parseISO(recurrence.endDate)
    : addDays(start, DEFAULT_HORIZON_DAYS)

  const dates: string[] = []
  let cursor = start

  while (dates.length < MAX_OCCURRENCES) {
    cursor =
      recurrence.type === "daily"
        ? addDays(cursor, recurrence.interval)
        : recurrence.type === "weekly"
          ? addWeeks(cursor, recurrence.interval)
          : addMonths(cursor, recurrence.interval)

    if (cursor > horizon) break
    dates.push(format(cursor, "yyyy-MM-dd"))
  }

  return dates
}
