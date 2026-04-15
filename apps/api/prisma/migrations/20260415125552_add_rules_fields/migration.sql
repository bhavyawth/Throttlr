/*
  Warnings:

  - Added the required column `ruleId` to the `request_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "request_logs" ADD COLUMN     "ruleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "rules" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "request_logs_ruleId_timestamp_idx" ON "request_logs"("ruleId", "timestamp");

-- AddForeignKey
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
