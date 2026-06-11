-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "orderStatus" TEXT NOT NULL DEFAULT 'created',
    "feeAmount" DECIMAL(18,4),
    "payoutAmount" DECIMAL(18,4),
    "paymentReceived" DECIMAL(18,4),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLogModels" (
    "id" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "version" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT NOT NULL,

    CONSTRAINT "EventLogModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerModels" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "debit" DECIMAL(18,4),
    "credit" DECIMAL(18,4),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerModels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "settlementDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "totalFees" DECIMAL(18,4) NOT NULL,
    "totalPayout" DECIMAL(18,4) NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventLogModels_idempotencyKey_key" ON "EventLogModels"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EventLogModels_aggregateId_version_idx" ON "EventLogModels"("aggregateId", "version");

-- CreateIndex
CREATE INDEX "EventLogModels_eventType_idx" ON "EventLogModels"("eventType");

-- CreateIndex
CREATE INDEX "EventLogModels_timestamp_idx" ON "EventLogModels"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "EventLogModels_aggregateId_version_key" ON "EventLogModels"("aggregateId", "version");

-- CreateIndex
CREATE INDEX "LedgerModels_orderId_idx" ON "LedgerModels"("orderId");

-- CreateIndex
CREATE INDEX "LedgerModels_account_idx" ON "LedgerModels"("account");

-- CreateIndex
CREATE INDEX "LedgerModels_timestamp_idx" ON "LedgerModels"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_idempotencyKey_key" ON "Settlement"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Settlement_settlementDate_idx" ON "Settlement"("settlementDate");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_settlementDate_key" ON "Settlement"("settlementDate");

-- AddForeignKey
ALTER TABLE "LedgerModels" ADD CONSTRAINT "LedgerModels_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
