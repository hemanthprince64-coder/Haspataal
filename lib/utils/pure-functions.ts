export function computeAvailableSlots(
  targetDate: Date,
  bookedSlots: Set<string>,
  allSlots: string[],
  now: Date = new Date()
): { time: string; available: boolean }[] {
  const isToday =
    targetDate.getTime() ===
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return allSlots.map((time) => {
    let available = !bookedSlots.has(time);

    if (isToday) {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      // If slot is in the past (using 15 min buffer)
      if (slotDateTime.getTime() <= now.getTime() + 15 * 60 * 1000) {
        available = false;
      }
    }

    return { time, available };
  });
}

export function calculateAgentCommission(
  subscriptionAmount: number,
  agentTier: 'SILVER' | 'GOLD' | 'PLATINUM'
): number {
  let rate = 0.10; // Default 10%
  if (agentTier === 'GOLD') rate = 0.15;
  if (agentTier === 'PLATINUM') rate = 0.20;

  return Math.round(subscriptionAmount * rate);
}

export function isAppointmentConflict(
  requestedSlot: string,
  existingBookings: string[]
): boolean {
  return existingBookings.includes(requestedSlot);
}
