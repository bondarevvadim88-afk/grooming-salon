-- CreateTable
CREATE TABLE "WorkBreak" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "WorkBreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkBreak_staffId_idx" ON "WorkBreak"("staffId");

-- CreateIndex
CREATE INDEX "WorkBreak_staffId_dayOfWeek_idx" ON "WorkBreak"("staffId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "WorkBreak" ADD CONSTRAINT "WorkBreak_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
