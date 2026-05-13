-- Add manager hierarchy to users
ALTER TABLE "User" ADD COLUMN "managerId" INTEGER;

ALTER TABLE "User"
ADD CONSTRAINT "User_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New CRM-style work tracking module
CREATE TABLE "WorkItem" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMP(3),
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "type" TEXT NOT NULL DEFAULT 'OTHER',
  "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
  "clientId" INTEGER,
  "assigneeId" INTEGER NOT NULL,
  "createdById" INTEGER NOT NULL,
  "approvedById" INTEGER,
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "lastSubmissionNote" TEXT,
  "lastRevisionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkItemEvent" (
  "id" SERIAL NOT NULL,
  "workItemId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkItemEvent_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "WorkItem"
ADD CONSTRAINT "WorkItem_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkItem"
ADD CONSTRAINT "WorkItem_assigneeId_fkey"
FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkItem"
ADD CONSTRAINT "WorkItem_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkItem"
ADD CONSTRAINT "WorkItem_approvedById_fkey"
FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkItemEvent"
ADD CONSTRAINT "WorkItemEvent_workItemId_fkey"
FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkItemEvent"
ADD CONSTRAINT "WorkItemEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "User_managerId_idx" ON "User"("managerId");
CREATE INDEX "WorkItem_assigneeId_status_idx" ON "WorkItem"("assigneeId", "status");
CREATE INDEX "WorkItem_createdById_status_idx" ON "WorkItem"("createdById", "status");
CREATE INDEX "WorkItem_clientId_idx" ON "WorkItem"("clientId");
CREATE INDEX "WorkItemEvent_workItemId_idx" ON "WorkItemEvent"("workItemId");
