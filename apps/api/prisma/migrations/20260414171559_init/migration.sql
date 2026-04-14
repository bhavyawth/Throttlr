-- CreateEnum
CREATE TYPE "Algorithm" AS ENUM ('SLIDING_WINDOW', 'TOKEN_BUCKET');

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "windowSizeSeconds" INTEGER NOT NULL,
    "maxRequests" INTEGER NOT NULL,
    "algorithm" "Algorithm" NOT NULL DEFAULT 'SLIDING_WINDOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT NOT NULL,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "rules_apiKeyId_idx" ON "rules"("apiKeyId");

-- CreateIndex
CREATE INDEX "request_logs_apiKeyId_timestamp_idx" ON "request_logs"("apiKeyId", "timestamp");

-- CreateIndex
CREATE INDEX "request_logs_userId_timestamp_idx" ON "request_logs"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_logs" ADD CONSTRAINT "request_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
