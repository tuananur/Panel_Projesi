CREATE TABLE IF NOT EXISTS "AccountingCredit" (
  "id" SERIAL NOT NULL,
  "bankName" TEXT NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "remainingAmount" DOUBLE PRECISION NOT NULL,
  "monthlyPayment" DOUBLE PRECISION NOT NULL,
  "lastPaidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountingCredit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientGroup" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "clientId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "members" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientGroup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ClientGroup_userId_idx" ON "ClientGroup"("userId");
CREATE INDEX IF NOT EXISTS "ClientGroup_clientId_idx" ON "ClientGroup"("clientId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientGroup_clientId_fkey') THEN
    ALTER TABLE "ClientGroup" ADD CONSTRAINT "ClientGroup_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClientGroup_userId_fkey') THEN
    ALTER TABLE "ClientGroup" ADD CONSTRAINT "ClientGroup_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
