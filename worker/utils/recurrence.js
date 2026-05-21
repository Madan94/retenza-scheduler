function getNextRunAt(fromDate, schedule) {
  const next = new Date(fromDate);
  const interval = schedule.recurrenceInterval;

  if (interval === "custom") {
    const value = schedule.recurrenceValue;
    const unit = schedule.recurrenceUnit;

    if (unit === "minutes") {
      next.setMinutes(next.getMinutes() + value);
    } else if (unit === "hours") {
      next.setHours(next.getHours() + value);
    } else {
      throw new Error(`Invalid recurrence unit: ${unit}`);
    }
    return next;
  }

  switch (interval) {
    case "hourly":
      next.setHours(next.getHours() + 1);
      break;
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      throw new Error(`Invalid recurrence interval: ${interval}`);
  }

  return next;
}

module.exports = { getNextRunAt };
