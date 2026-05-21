const messageQueue = require("../queues/messageQueues");

/** Only queued jobs — never touch active (worker may be processing it). */
async function removePendingJobsForSchedule(scheduleId) {
  const states = ["delayed", "waiting"];
  const jobs = await messageQueue.getJobs(states);

  for (const job of jobs) {
    if (job.data?.scheduleId === scheduleId) {
      try {
        await job.remove();
      } catch (err) {
        if (!err.message?.includes("locked")) {
          throw err;
        }
      }
    }
  }
}

async function enqueueSchedule(schedule) {
  await removePendingJobsForSchedule(schedule.id);

  const runAt = new Date(schedule.scheduledAt).getTime();
  const delay = Math.max(runAt - Date.now(), 0);

  await messageQueue.add(
    "sendMessage",
    { scheduleId: schedule.id },
    {
      delay,
      jobId: `${schedule.id}-${runAt}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
}

async function removeScheduleJob(scheduleId) {
  await removePendingJobsForSchedule(scheduleId);
}

module.exports = {
  enqueueSchedule,
  removeScheduleJob,
  removePendingJobsForSchedule,
};
