import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

async function main() {
  console.log("Cleaning old schedules if they exist...");
  await prisma.premiumSchedule.deleteMany();

  console.log("Fetching policies...");
  const policies = await prisma.policy.findMany()
  for (const p of policies) {
    if (p.premiumMethod === "single") continue;

    const start = new Date(p.startDate);
    const startDay = start.getUTCDate();
    
    let endUTC: Date;
    if (p.lastPremiumDate) {
      endUTC = new Date(p.lastPremiumDate);
    } else {
      endUTC = new Date(Date.UTC(start.getUTCFullYear() + 50, start.getUTCMonth(), start.getUTCDate()));
    }

    let paidLimitUTC: Date | null = null;
    if (p.lastPaidDate) {
      paidLimitUTC = new Date(p.lastPaidDate);
    } else {
      const now = new Date();
      paidLimitUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    }

    const schedules = [];
    let nextDate = incrementCycle(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), startDay)), startDay, p.premiumMethod);

    while (nextDate <= endUTC) {
      const isPaid = paidLimitUTC ? nextDate <= paidLimitUTC : false;
      schedules.push({
        policyId: p.id,
        date: nextDate,
        isPaid
      });
      nextDate = incrementCycle(nextDate, startDay, p.premiumMethod);
    }

    if (schedules.length > 0) {
      // Create in batches to avoid limits
      console.log(`Creating ${schedules.length} schedules for policy ${p.beneficiary}`);
      await prisma.premiumSchedule.createMany({ data: schedules });
    }
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect())
