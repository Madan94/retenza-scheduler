const PRESET_INTERVALS = ["hourly", "daily", "weekly", "monthly", "custom"];
const CUSTOM_UNITS = ["minutes", "hours"];

function isValidInterval(interval) {
  return PRESET_INTERVALS.includes(interval);
}

function validateRecurrence({ recurrenceInterval, recurrenceValue, recurrenceUnit }) {
  if (!recurrenceInterval || !isValidInterval(recurrenceInterval)) {
    return { ok: false, error: "Invalid recurrenceInterval", allowed: PRESET_INTERVALS };
  }

  if (recurrenceInterval !== "custom") {
    return { ok: true };
  }

  const value = Number(recurrenceValue);
  if (!Number.isInteger(value) || value < 1) {
    return { ok: false, error: "recurrenceValue must be a positive integer for custom interval" };
  }

  if (!CUSTOM_UNITS.includes(recurrenceUnit)) {
    return { ok: false, error: "Invalid recurrenceUnit", allowed: CUSTOM_UNITS };
  }

  const max = recurrenceUnit === "minutes" ? 10080 : 168;
  if (value > max) {
    return {
      ok: false,
      error: `recurrenceValue too large (max ${max} ${recurrenceUnit})`,
    };
  }

  return { ok: true };
}

function formatRecurrence(schedule) {
  if (!schedule.recurring) return "One-time";
  if (schedule.recurrenceInterval === "custom") {
    return `Every ${schedule.recurrenceValue} ${schedule.recurrenceUnit}`;
  }
  const labels = {
    hourly: "Every hour",
    daily: "Every day",
    weekly: "Every week",
    monthly: "Every month",
  };
  return labels[schedule.recurrenceInterval] ?? schedule.recurrenceInterval;
}

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

module.exports = {
  PRESET_INTERVALS,
  CUSTOM_UNITS,
  isValidInterval,
  validateRecurrence,
  formatRecurrence,
  getNextRunAt,
};
