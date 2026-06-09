ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "remindAt" TIMESTAMP(3);
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "reminderSentAt" TIMESTAMP(3);
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "reminderUserId" INTEGER;

CREATE INDEX IF NOT EXISTS "Note_reminderUserId_remindAt_reminderSentAt_idx"
  ON "Note"("reminderUserId", "remindAt", "reminderSentAt");
