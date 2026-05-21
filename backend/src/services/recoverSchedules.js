const prisma = require("../utils/prisma");
const { enqueueSchedule } = require("./scheduleQueue");

async function recoverSchedules() {
  const schedules = await prisma.schedule.findMany({
    where: {
      status: { in: ["pending", "active"] },
      recurring: true,
    },
  });

  const oneTime = await prisma.schedule.findMany({
    where: {
      status: "pending",
      recurring: false,
    },
  });

  const toRecover = [...schedules, ...oneTime];

  for (const schedule of toRecover) {
    await enqueueSchedule(schedule);
  }

  if (toRecover.length > 0) {
    console.log(`Recovered ${toRecover.length} schedule(s) into the queue`);
  }
}

module.exports = recoverSchedules;
