import Rentals from "../models/Rentals.model.ts";


const ACTIVE_STATUSES = ["pending", "confirmed", "ongoing"] as const;

export interface DateRange {
  start: Date;
  end: Date;
}


export const getFullyBookedRanges = async (
  itemId: string,
  itemQuantity: number
): Promise<DateRange[]> => {
  const rentals = await Rentals.find({
    itemId,
    status: { $in: ACTIVE_STATUSES },
  }).select("startDate returnDate quantity");

  if (!rentals.length) return [];

  type Event = { date: number; delta: number };
  const events: Event[] = [];

  for (const r of rentals) {
    const start = new Date(r.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(r.returnDate);
    end.setHours(0, 0, 0, 0);

    const dayAfterEnd = new Date(end);
    dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);

    events.push({ date: start.getTime(), delta: r.quantity || 1 });
    events.push({ date: dayAfterEnd.getTime(), delta: -(r.quantity || 1) });
  }

  // Sort by date; if dates tie, process removals (-) before additions (+)
  // so a booking ending the same day another starts doesn't falsely
  // register as "fully booked".
  events.sort((a, b) => a.date - b.date || a.delta - b.delta);

  const ranges: DateRange[] = [];
  let running = 0;
  let rangeStart: number | null = null;

  for (const event of events) {
    const before = running;
    running += event.delta;

    const enteredFull = before < itemQuantity && running >= itemQuantity;
    const leftFull = before >= itemQuantity && running < itemQuantity;

    if (enteredFull) {
      rangeStart = event.date;
    }

    if (leftFull && rangeStart !== null) {
      const rangeEnd = new Date(event.date);
      rangeEnd.setDate(rangeEnd.getDate() - 1); // last fully-booked day
      ranges.push({ start: new Date(rangeStart), end: rangeEnd });
      rangeStart = null;
    }
  }

  return ranges;
};


export const checkAvailability = async (
  itemId: string,
  startDate: Date,
  endDate: Date,
  requestedQty: number,
  itemQuantity: number
): Promise<{ available: boolean; availableFrom?: Date }> => {
  const overlapping = await Rentals.find({
    itemId,
    status: { $in: ACTIVE_STATUSES },
    // classic interval-overlap condition
    startDate: { $lte: endDate },
    returnDate: { $gte: startDate },
  }).select("quantity returnDate");

  const bookedQty = overlapping.reduce((sum, r) => sum + (r.quantity || 1), 0);

  if (bookedQty + requestedQty <= itemQuantity) {
    return { available: true };
  }

  const availableFrom = overlapping.reduce(
    (latest, r) => (r.returnDate > latest ? r.returnDate : latest),
    startDate
  );

  return { available: false, availableFrom };
};

/**
 * Walks forward day-by-day from a preferred start date until it finds
 * one that isn't inside any fully-booked range. Reuses the same
 * interval data the sweep-line algorithm already computed.
 */
export const getNextAvailableStartDate = async (
  itemId: string,
  itemQuantity: number,
  preferredStart: Date = new Date()
): Promise<Date> => {
  const ranges = await getFullyBookedRanges(itemId, itemQuantity);

  const candidate = new Date(preferredStart);
  candidate.setHours(0, 0, 0, 0);

  const isBlocked = (date: Date) =>
    ranges.some((r) => date >= r.start && date <= r.end);

  const MAX_LOOKAHEAD_DAYS = 365;
  let i = 0;
  while (isBlocked(candidate) && i < MAX_LOOKAHEAD_DAYS) {
    candidate.setDate(candidate.getDate() + 1);
    i++;
  }

  return candidate;
};

/**
 * Checks whether a requested [start, end] range overlaps any
 * fully-booked range for the item.
 */
export const rangeOverlapsBlocked = (
  start: Date,
  end: Date,
  ranges: DateRange[]
): boolean => ranges.some((r) => start <= r.end && end >= r.start);