async function removePendingJobsForSchedule(queue, scheduleId) {
  const states = ["delayed", "waiting"];
  const jobs = await queue.getJobs(states);

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

module.exports = { removePendingJobsForSchedule };
