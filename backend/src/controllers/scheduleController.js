const prisma = require("../utils/prisma");
const { PRESET_INTERVALS, validateRecurrence } = require("../utils/recurrence");
const { enqueueSchedule, removeScheduleJob } = require("../services/scheduleQueue");

const createSchedule = async (req, res) => {
  try {
    const {
      templateId,
      recipient,
      scheduledAt,
      recurring = false,
      recurrenceInterval,
      recurrenceValue,
      recurrenceUnit,
    } = req.body;

    const missing = [];
    if (!templateId) missing.push("templateId");
    if (!recipient) missing.push("recipient");
    if (!scheduledAt) missing.push("scheduledAt");

    if (missing.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missing,
        example: {
          templateId: "<uuid from GET /templates>",
          recipient: "user@example.com",
          scheduledAt: "2026-05-20T10:00:00.000Z",
          recurring: true,
          recurrenceInterval: "custom",
          recurrenceValue: 30,
          recurrenceUnit: "minutes",
        },
      });
    }

    const isRecurring = Boolean(recurring);

    if (isRecurring && !recurrenceInterval) {
      return res.status(400).json({
        error: "recurrenceInterval is required when recurring is true",
        allowed: PRESET_INTERVALS,
      });
    }

    if (isRecurring) {
      const validation = validateRecurrence({
        recurrenceInterval,
        recurrenceValue,
        recurrenceUnit,
      });
      if (!validation.ok) {
        return res.status(400).json(validation);
      }
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        error: "Invalid scheduledAt",
        message: "Use an ISO 8601 date string, e.g. 2026-05-20T10:00:00.000Z",
      });
    }

    if (scheduledDate.getTime() <= Date.now() && !isRecurring) {
      return res.status(400).json({
        error: "scheduledAt must be in the future for one-time schedules",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        templateId,
        recipient,
        scheduledAt: scheduledDate,
        recurring: isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : null,
        recurrenceValue:
          isRecurring && recurrenceInterval === "custom"
            ? Number(recurrenceValue)
            : null,
        recurrenceUnit:
          isRecurring && recurrenceInterval === "custom"
            ? recurrenceUnit
            : null,
        status: isRecurring ? "active" : "pending",
      },
    });

    await enqueueSchedule(schedule);

    res.status(201).json(schedule);
  } catch (error) {
    console.log(error);

    if (error.code === "P2003") {
      return res.status(400).json({
        error: "templateId not found",
        message: "Create a template first, then use its id as templateId",
      });
    }

    res.status(500).json({
      error: "Failed to create schedule",
    });
  }
};

const getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        template: true,
      },
      orderBy: {
        scheduledAt: "desc",
      },
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch schedules",
    });
  }
};

const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    if (schedule.status === "cancelled") {
      return res.json(schedule);
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: { status: "cancelled" },
      include: { template: true },
    });

    await removeScheduleJob(id);

    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to cancel schedule" });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  cancelSchedule,
};
