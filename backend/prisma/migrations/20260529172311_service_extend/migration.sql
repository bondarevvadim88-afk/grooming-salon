/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "code" TEXT,
ADD COLUMN     "icon" TEXT DEFAULT 'ti-scissors',
ADD COLUMN     "isBookable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "petType" TEXT NOT NULL DEFAULT 'DOG',
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");
