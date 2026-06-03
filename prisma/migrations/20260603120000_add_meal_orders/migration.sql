-- CreateTable
CREATE TABLE "MealOrder" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "personCount" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealOrder_date_idx" ON "MealOrder"("date");
