/*
  Warnings:

  - You are about to drop the column `fromDepartment` on the `DocumentTransfer` table. All the data in the column will be lost.
  - You are about to drop the column `toDepartment` on the `DocumentTransfer` table. All the data in the column will be lost.
  - Added the required column `fromDepartmentId` to the `DocumentTransfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toDepartmentId` to the `DocumentTransfer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_documentId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTransfer" DROP CONSTRAINT "DocumentTransfer_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTransfer" DROP CONSTRAINT "DocumentTransfer_transferredById_fkey";

-- AlterTable
ALTER TABLE "DocumentTransfer" DROP COLUMN "fromDepartment",
DROP COLUMN "toDepartment",
ADD COLUMN     "fromDepartmentId" INTEGER NOT NULL,
ADD COLUMN     "toDepartmentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_departmentId_year_key" ON "DocumentSequence"("departmentId", "year");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Document_trackingNumber_idx" ON "Document"("trackingNumber");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_currentDepartmentId_idx" ON "Document"("currentDepartmentId");

-- AddForeignKey
ALTER TABLE "DocumentTransfer" ADD CONSTRAINT "DocumentTransfer_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTransfer" ADD CONSTRAINT "DocumentTransfer_fromDepartmentId_fkey" FOREIGN KEY ("fromDepartmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTransfer" ADD CONSTRAINT "DocumentTransfer_toDepartmentId_fkey" FOREIGN KEY ("toDepartmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentTransfer" ADD CONSTRAINT "DocumentTransfer_transferredById_fkey" FOREIGN KEY ("transferredById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSequence" ADD CONSTRAINT "DocumentSequence_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Document_referenceNumber_key" RENAME TO "Document_trackingNumber_key";
