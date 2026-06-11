import { prisma } from "../lib/prisma.js";
import { formatMoney, validateAmount } from "../utils/money.js";
import { mockProssessPayment } from "./stripService.js";

type PaymentInput = {
  orderId: string;
  amount: string;
  customerId: string;
  paymentMethod: string;
  idempotencyKey: string;
};

export const paymentProcess = async (data: PaymentInput) => {
  const { orderId, amount, customerId, paymentMethod, idempotencyKey } = data;

  if (!orderId || !amount || !customerId || !paymentMethod || !idempotencyKey) {
    throw new Error("Data payment tidak valid");
  }

  const money = validateAmount(amount);
  const moneyString = formatMoney(money);

  const existEventOrder = await prisma.eventLogModels.findUnique({
    where: {
      idempotencyKey,
    },
  });

  if (existEventOrder) {
    return {
      idempotencyKey: true,
      message: "Data sudah pernah dibuat",
      data: existEventOrder,
    };
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      customerId,
    },
  });

  if (!order) {
    throw new Error("Order tidak valid");
  }

  if (order.paymentStatus !== "pending") {
    throw new Error("Order sudah dibayar");
  }
  const orderAmount = validateAmount(order.amount.toString());

  if (!money.eq(orderAmount)) {
    throw new Error("Jumlah pembayaran tidak sesuai dengan jumlah order");
  }

  const DataStrip = { orderId, amount: moneyString, customerId };

  const stripResult = await mockProssessPayment(DataStrip);

  const result = await prisma.$transaction(async (tx) => {
    const latesEvent = await tx.eventLogModels.findFirst({
      where: {
        aggregateId: orderId,
      },

      orderBy: {
        version: "desc",
      },
    });

    const orderVersion = latesEvent ? parseInt(latesEvent.version) + 1 : 1;

    const event = await tx.eventLogModels.create({
      data: {
        aggregateId: orderId,
        eventType: "PaymentConfirmed",
        payload: {
          orderId,
          amount: moneyString,
          customerId,
          chargeId: stripResult.chargeId,
          status: stripResult.status,
        },
        version: orderVersion.toString(),
        idempotencyKey,
      },
    });

    await tx.ledgerModels.createMany({
      data: [
        {
          orderId,
          account: "payment_received",
          debit: moneyString,
          credit: null,
        },
        {
          orderId,
          account: "order_balance",
          debit: null,
          credit: moneyString,
        },
      ],
    });

    const updatedOrder = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: "paid",
        paymentReceived: moneyString,
        version: {
          increment: 1,
        },
      },
    });

    return {
      order: updatedOrder,
      event,
      stripe: stripResult,
    };
  });

  return {
    idempotent: false,
    message: "Payment berhasil diproses",
    data: result,
  };
};
