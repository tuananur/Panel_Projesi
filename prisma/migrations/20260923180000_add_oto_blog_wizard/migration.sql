-- AlterTable
ALTER TABLE "Client" ADD COLUMN "otoBlogAiSettings" TEXT;
ALTER TABLE "Client" ADD COLUMN "otoBlogDraft" TEXT;

-- CreateTable
CREATE TABLE "OtoBlogTempImage" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtoBlogTempImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OtoBlogTempImage_token_key" ON "OtoBlogTempImage"("token");
CREATE INDEX "OtoBlogTempImage_clientId_idx" ON "OtoBlogTempImage"("clientId");

ALTER TABLE "OtoBlogTempImage" ADD CONSTRAINT "OtoBlogTempImage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
