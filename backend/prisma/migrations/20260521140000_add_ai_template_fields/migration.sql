-- AlterTable
ALTER TABLE "Template" ADD COLUMN "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "aiPrompt" TEXT;
