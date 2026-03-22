export function formatDate(date: string | Date | null): string {
  if (!date) return "-";
  const d = new Date(date);
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function calculateNextPremiumDate(
  startDateStr: string | Date,
  method: string,
  lastPremiumDateStr?: string | Date | null
): Date | null {
  if (method === "single" || !startDateStr) return null;

  const start = new Date(startDateStr);
  const startYear = start.getUTCFullYear();
  const startMonth = start.getUTCMonth();
  const startDay = start.getUTCDate();

  const now = new Date();
  
  // Baseline compares strictly at midnight UTC to prevent local hour offset bugs
  const baseline = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let nextDate = new Date(Date.UTC(startYear, startMonth, startDay));

  // Advance by purely mathematical interval until strictly on or after today
  while (nextDate < baseline) {
    let y = nextDate.getUTCFullYear();
    let m = nextDate.getUTCMonth();

    if (method === "monthly") {
      m += 1;
    } else if (method === "quarterly") {
      m += 3;
    } else if (method === "half_yearly") {
      m += 6;
    } else if (method === "yearly") {
      y += 1;
    }

    // Roll over into correct year
    const yearsToAdd = Math.floor(m / 12);
    y += yearsToAdd;
    m = m % 12;

    // End-of-month clamp logic (e.g. Jan 31 -> Feb 28, but retains 31 for March)
    const daysInNextMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const clampedDay = Math.min(startDay, daysInNextMonth);

    nextDate = new Date(Date.UTC(y, m, clampedDay));
  }

  // If the next due date exceeds the final "End Date" (lastPremiumDate), it's fully paid!
  if (lastPremiumDateStr) {
    const endDate = new Date(lastPremiumDateStr);
    const endUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
    if (nextDate > endUTC) {
      return null;
    }
  }

  return nextDate;
}
