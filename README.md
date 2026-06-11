# Ent-JFE-20/05/26 - Backend Financial Order System

## Overview

This repository contains the backend implementation for the Junior Fullstack Engineer technical test.

The project focuses on building a financial order system with event logging, double-entry ledger entries, Decimal-based money handling, idempotency, mock payment processing, fee calculation, and ledger balance verification.

The backend is built separately from the frontend.

## Tech Stack

* Node.js
* Fastify
* TypeScript
* Prisma
* PostgreSQL / Supabase
* Decimal.js
* Jest planned

## Backend Features Implemented

### 1. Order Recording

The backend supports order creation through the `POST /orders` endpoint.

When an order is created, the system records:

* Order data
* `OrderCreated` event in the event log
* Double-entry ledger entries

Ledger entries created during order creation:

```txt
DEBIT  order_balance
CREDIT order_pending
```

### 2. Event Log

The system records important financial events in an immutable event log.

Implemented event types:

```txt
OrderCreated
PaymentConfirmed
FeeCalculated
```

Each event contains:

* Aggregate ID
* Event type
* Payload
* Version
* Timestamp
* Idempotency key

### 3. Double-Entry Ledger

The system stores financial movement using debit and credit entries.

Each financial operation creates balanced ledger entries.

Implemented ledger accounts:

```txt
order_balance
order_pending
payment_received
fees_owed
```

Ledger verification checks whether:

```txt
totalDebit - totalCredit = 0
```

### 4. Decimal Money Handling

All monetary values are handled using Decimal.js.

Amounts are validated and formatted using 4 decimal places.

Example:

```txt
100 -> 100.0000
100.5 -> 100.5000
```

Invalid values such as negative amounts, empty values, and non-numeric values are rejected.

### 5. Idempotency

The backend uses `idempotencyKey` to prevent duplicate processing.

Implemented idempotency flow:

* Duplicate order creation returns the existing event.
* Duplicate payment request with the same key returns the existing payment event.
* This prevents duplicate event and ledger creation.

### 6. Mock Payment Flow

The backend includes a mock Stripe-like payment service.

The mock payment service returns:

```json
{
  "chargeId": "mock_charge_order-001_123456789",
  "status": "succeeded"
}
```

After payment is confirmed, the system creates:

```txt
EventLog: PaymentConfirmed

Ledger:
DEBIT  payment_received
CREDIT order_balance
```

### 7. Fee Calculation

After payment succeeds, the backend calculates a 3% fee.

Example:

```txt
Amount: 100.0000
Fee: 3.0000
Payout: 97.0000
```

The system creates:

```txt
EventLog: FeeCalculated

Ledger:
DEBIT  fees_owed
CREDIT payment_received
```

The order is updated with:

* `feeAmount`
* `payoutAmount`

### 8. Ledger Balance Verification

The backend provides an endpoint to verify whether an order ledger is balanced.

```txt
GET /verify-ledger/:id
```

Example response:

```json
{
  "message": "Ledger berhasil diverifikasi",
  "data": {
    "orderId": "order-001",
    "totalDebit": "203.0000",
    "totalCredit": "203.0000",
    "difference": "0.0000",
    "balanced": true
  }
}
```

## API Endpoints

### Create Order

```txt
POST /orders
```

Request body:

```json
{
  "orderId": "order-001",
  "customerId": "cust-001",
  "amount": "100.0000",
  "paymentMethod": "card",
  "idempotencyKey": "create-order-001"
}
```

### Get Order Detail

```txt
GET /orders/:id
```

Example:

```txt
GET /orders/order-001
```

### Get Order Ledger

```txt
GET /orders/:id/ledger
```

Example:

```txt
GET /orders/order-001/ledger
```

### Verify Ledger Balance

```txt
GET /verify-ledger/:id
```

Example:

```txt
GET /verify-ledger/order-001
```

### Pay Order

```txt
POST /orders/:id/pay
```

Request body:

```json
{
  "amount": "100.0000",
  "customerId": "cust-001",
  "idempotencyKey": "pay-order-001"
}
```

## Example Flow

### 1. Create Order

```txt
POST /orders
```

This creates:

```txt
Order
EventLog: OrderCreated
Ledger:
- DEBIT order_balance
- CREDIT order_pending
```

### 2. Pay Order

```txt
POST /orders/:id/pay
```

This creates:

```txt
EventLog: PaymentConfirmed
Ledger:
- DEBIT payment_received
- CREDIT order_balance
```

### 3. Calculate Fee

Fee is calculated automatically after payment.

This creates:

```txt
EventLog: FeeCalculated
Ledger:
- DEBIT fees_owed
- CREDIT payment_received
```

### 4. Verify Ledger

```txt
GET /verify-ledger/:id
```

The system verifies whether total debit equals total credit.

## Environment Variables

Create a `.env` file in the backend root directory.

Example:

```env
DATABASE_URL="postgresql://your-database-url"
```

For Prisma 7, database configuration may also be handled through `prisma.config.ts`.

Do not commit `.env` to GitHub.

## How to Run Locally

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Run migration:

```bash
npx prisma migrate dev
```

Run development server:

```bash
npm run dev
```

The backend will run on:

```txt
http://localhost:8080
```

## Prisma Studio

To inspect database records:

```bash
npx prisma studio
```

Then check:

```txt
Order
EventLogModels
LedgerModels
```

## Current Implementation Status

### Completed

* Fastify backend setup
* Prisma + PostgreSQL/Supabase connection
* Order creation
* Event log for order creation
* Double-entry ledger for order creation
* Decimal amount validation
* Idempotency for order creation
* Get order detail endpoint
* Get order ledger endpoint
* Ledger balance verification endpoint
* Mock payment processing
* Payment confirmation event
* Payment ledger entries
* Fee calculation
* Fee ledger entries
* Order payout calculation

### Not Fully Completed Yet

The following requirements are planned but not fully completed in the current version:

* Daily settlement flow
* `SettlementProcessed` event
* Settlement ledger entries
* Settlement idempotency
* Full Jest test suite
* 100 and 1,000 concurrent order stress tests
* Version conflict handling for simultaneous payment requests
* Complete production deployment

## Planned Improvements

* Implement daily settlement flow.
* Add settlement ledger entries:

```txt
DEBIT  seller_payout
CREDIT payment_received
```

* Add Jest tests for:

  * happy path
  * idempotency
  * ledger balance
  * Decimal precision
  * invalid transition
  * concurrent orders
  * duplicate payment prevention
  * settlement idempotency
* Add optimistic locking using event version.
* Add stress test script for concurrent order creation.
* Add production deployment for backend API.

## Notes

This backend prioritizes the financial core flow first: event logging, ledger correctness, idempotency, Decimal precision, mock payment, fee calculation, and ledger verification.

Some advanced requirements are documented as pending improvements due to the limited implementation time.
