/**
 * lib/notification-curfew.ts
 *
 * Notification curfew utility — defers non-urgent notifications
 * to the next allowed window (8 AM – 10 PM IST).
 *
 * Returns:
 *  'DEFER'  → outside curfew; caller should enqueue for next 08:00 IST
 *  'NOW'    → within curfew window; send immediately
 *
 * IST = UTC + 5:30.
 * Hour conversion adds the half-hour offset: at UTC 02:30 it is exactly 08:00 IST.
 */

const CURFEW_START_HOUR = 8; // 08:00 IST
const CURFEW_END_HOUR = 22; // 22:00 IST

/**
 * Returns the next 08:00 IST datetime after `now`.
 */
function nextWindowStart(now: Date): Date {
  const d = new Date(now);
  d.setHours(CURFEW_START_HOUR, 0, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Decide whether a notification may be sent now or must be deferred.
 * Converts UTC time to IST hours, including the +30 min offset.
 *
 * @param now Optional `Date` override for testing. Defaults to `new Date()`.
 * @returns `'NOW'` or `'DEFER'`
 */
export function evaluateCurfew(now: Date = new Date()): 'NOW' | 'DEFER' {
  const utcHour = now.getUTCHours();
  const minutesPastHalf = now.getUTCMinutes() + 30; // shift by +30 min
  const istHourRollover = Math.floor((utcHour + 5 + minutesPastHalf / 60) % 24);
  const inWindow = istHourRollover >= CURFEW_START_HOUR && istHourRollover < CURFEW_END_HOUR;

  if (!inWindow) {
    const next = nextWindowStart(now);
    console.warn(
      `[Curfew] Notification deferred — outside 08:00–22:00 IST. ` +
        `Next window: ${next.toISOString()}`,
    );
    return 'DEFER';
  }

  return 'NOW';
}

/**
 * Given a curfew decision, returns the delay (ms) until the next allowed window,
 * or 0 if the notification may be sent immediately.
 *
 * @param now Optional `Date` override for testing.
 * @returns delay in milliseconds.
 */
export function getCurfewDelayMs(now: Date = new Date()): number {
  if (evaluateCurfew(now) === 'NOW') return 0;
  return nextWindowStart(now).getTime() - now.getTime();
}

export { CURFEW_START_HOUR, CURFEW_END_HOUR };
