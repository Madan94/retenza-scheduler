const prisma = require("../utils/prisma");
const messageQueue = require("../queues/messageQueues");

const createSchedule = async (req, res) => {
  try {
    const {
      templateId,
      recipient,
      scheduledAt,
      recurring = false,
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
          recurring: false,
        },
      });
    }

    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        error: "Invalid scheduledAt",
        message: "Use an ISO 8601 date string, e.g. 2026-05-20T10:00:00.000Z",
      });
    }

    const schedule = await prisma.schedule.create({
      data: {
        templateId,
        recipient,
        scheduledAt: scheduledDate,
        recurring: Boolean(recurring),
      },
    });

    await messageQueue.add(
        "sendMessage",
        {
          scheduleId: schedule.id,
        },
        {
          delay: Math.max(
            new Date(scheduledAt).getTime() - Date.now(),
            0
          ),
        }
    );

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

module.exports = {
  createSchedule,
  getSchedules,
};