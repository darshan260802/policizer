export function formatDate(date: string | Date | null): string {
  if (!date) return "-";
  const d = new Date(date);
  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function incrementCycle(nextDate: Date, startDay: number, method: string) {
  let y = nextDate.getUTCFullYear();
  let m = nextDate.getUTCMonth();

  if (method === "monthly") m += 1;
  else if (method === "quarterly") m += 3;
  else if (method === "half_yearly") m += 6;
  else if (method === "yearly") m += 12;

  const yearsToAdd = Math.floor(m / 12);
  y += yearsToAdd;
  m = m % 12;

  const daysInNextMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const clampedDay = Math.min(startDay, daysInNextMonth);

  return new Date(Date.UTC(y, m, clampedDay));
}

export function calculateNextPremiumDate(
  startDateStr: string | Date,
  method: string,
  endDateStr?: string | Date | null,
  lastPaidDateStr?: string | Date | null
): Date | null {
  if (method === "single" || !startDateStr) return null;

  const start = new Date(startDateStr);
  const startDay = start.getUTCDate();

  let baseline: Date;
  if (lastPaidDateStr) {
    const lp = new Date(lastPaidDateStr);
    baseline = new Date(Date.UTC(lp.getUTCFullYear(), lp.getUTCMonth(), lp.getUTCDate()));
  } else {
    const now = new Date();
    baseline = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    baseline.setUTCDate(baseline.getUTCDate() - 1); 
  }

  let nextDate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), startDay));

  while (nextDate <= baseline) {
    nextDate = incrementCycle(nextDate, startDay, method);
  }

  if (endDateStr) {
    const endDate = new Date(endDateStr);
    const endUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
    if (nextDate > endUTC) {
      return null;
    }
  }

  return nextDate;
}

export function generatePremiumSchedules(
  policyId: string,
  startDateStr: string | Date,
  method: string,
  endDateStr?: string | Date | null,
  lastPaidDateStr?: string | Date | null
) {
  if (method === "single" || !startDateStr) return [];

  const start = new Date(startDateStr);
  const startDay = start.getUTCDate();
  
  let endUTC: Date;
  if (endDateStr) {
    const endDate = new Date(endDateStr);
    endUTC = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  } else {
    endUTC = new Date(Date.UTC(start.getUTCFullYear() + 50, start.getUTCMonth(), start.getUTCDate()));
  }

  let paidLimitUTC: Date | null = null;
  if (lastPaidDateStr) {
    const lp = new Date(lastPaidDateStr);
    paidLimitUTC = new Date(Date.UTC(lp.getUTCFullYear(), lp.getUTCMonth(), lp.getUTCDate()));
  } else {
    const now = new Date();
    paidLimitUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  }

  const schedules = [];
  let nextDate = incrementCycle(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), startDay)), startDay, method);

  while (nextDate <= endUTC) {
    schedules.push({
      policyId,
      date: nextDate,
      isPaid: paidLimitUTC ? nextDate <= paidLimitUTC : false
    });
    nextDate = incrementCycle(nextDate, startDay, method);
  }
  return schedules;
}
