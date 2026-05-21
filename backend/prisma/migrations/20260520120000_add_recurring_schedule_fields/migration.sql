-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN "recurrenceInterval" TEXT,
ADD COLUMN "lastSentAt" TIMESTAMP(3);
