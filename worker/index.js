require("dotenv").config();

const { Worker, Queue } = require("bullmq");
const IORedis = require("ioredis");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const { getNextRunAt } = require("./utils/recurrence");
const { sendTelegramMessage } = require("./utils/telegram");
const { removePendingJobsForSchedule } = require("./utils/queue");

const prisma = new PrismaClient();

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

const messageQueue = new Queue("messageQueue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMessage(schedule) {
  if (schedule.template.channel === "email") {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: schedule.recipient,
      subject: schedule.template.name,
      text: schedule.template.content,
    });
  }

  if (schedule.template.channel === "telegram") {
    await sendTelegramMessage(
      process.env.TELEGRAM_BOT_TOKEN,
      schedule.recipient,
      schedule.template.content
    );
  }
}

async function rescheduleRecurring(schedule) {
  const nextAt = getNextRunAt(new Date(), schedule);

  await prisma.schedule.update({
    where: { id: schedule.id },
    data: {
      scheduledAt: nextAt,
      lastSentAt: new Date(),
      status: "active",
    },
  });

  const delay = Math.max(nextAt.getTime() - Date.now(), 0);

  await removePendingJobsForSchedule(messageQueue, schedule.id);

  await messageQueue.add(
    "sendMessage",
    { scheduleId: schedule.id },
    {
      delay,
      jobId: `${schedule.id}-${nextAt.getTime()}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log(
    `Recurring message sent; next run at ${nextAt.toISOString()} (in ${Math.round(delay / 1000)}s)`
  );
}

const worker = new Worker(
  "messageQueue",
  async (job) => {
    const { scheduleId } = job.data;

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { template: true },
    });

    if (!schedule || schedule.status === "cancelled") {
      return;
    }

    await sendMessage(schedule);

    if (schedule.recurring && schedule.recurrenceInterval) {
      const fresh = await prisma.schedule.findUnique({
        where: { id: scheduleId },
      });
      if (!fresh || fresh.status === "cancelled") {
        return;
      }
      await rescheduleRecurring(fresh);
      return;
    }

    await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: "sent",
        lastSentAt: new Date(),
      },
    });

    console.log("Message sent");
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error("Job failed:", job?.id, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err.message);
});

console.log("Worker running...");
