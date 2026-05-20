require("dotenv").config();

const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const axios = require("axios");

const prisma = new PrismaClient();

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const worker = new Worker(
  "messageQueue",
  async (job) => {
    const { scheduleId } = job.data;

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
      include: {
        template: true,
      },
    });

    if (!schedule) return;

    if (schedule.template.channel === "email") {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: schedule.recipient,
        subject: schedule.template.name,
        text: schedule.template.content,
      });
    }

    if (schedule.template.channel === "telegram") {
      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: schedule.recipient,
          text: schedule.template.content,
        }
      );
    }

    await prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: {
        status: "sent",
      },
    });

    console.log("Message sent");
  },
  { connection }
);

console.log("Worker running...");