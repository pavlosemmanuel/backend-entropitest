import { prisma } from "../lib/prisma.js";
import { calculatedFee, calculatedPayout, formatMoney, validateAmount } from "../utils/money.js";

type CalculateFeesInput = {
  orderId: string;
  amount: string;
  idempotencyKey: string;
};

export const calculateFees = async (data: CalculateFeesInput) => {
  const { orderId, amount, idempotencyKey } = data;

  if (!orderId || !amount || !idempotencyKey) {
    throw new Error("orderId, amount, dan idempotencyKey wajib diisi");
  }

  const money = validateAmount(amount);
  const fee = calculatedFee(money);
  const payout = calculatedPayout(money);

  const moneyString = formatMoney(money);
  const feeString = formatMoney(fee);
  const payoutString = formatMoney(payout);

  const existingEvent = await prisma.eventLogModels.findUnique({
    where: {
      idempotencyKey,
    },
  });

  if (existingEvent) {
    return {
      idempotent: true,
      message: "Fee sudah pernah dihitung",
      event: existingEvent,
    };
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  if (order.paymentStatus !== "paid") {
    throw new Error("Fee hanya bisa dihitung setelah payment berhasil");
  }

  const result = await prisma.$transaction(async (tx) => {
    const latestEvent = await tx.eventLogModels.findFirst({
      where: {
        aggregateId: orderId,
      },
      orderBy: {
        version: "desc",
      },
    });

    const nextVersion = latestEvent ? latestEvent.version + 1 : 1;

    const event = await tx.eventLogModels.create({
      data: {
        aggregateId: orderId,
        eventType: "FeeCalculated",
        payload: {
          orderId,
          amount: moneyString,
          fee: feeString,
          payout: payoutString,
        },
        version: nextVersion.toString(),
        idempotencyKey,
      },
    });

    await tx.ledgerModels.createMany({
      data: [
        {
          orderId,
          account: "fees_owed",
          debit: feeString,
          credit: null,
        },
        {
          orderId,
          account: "payment_received",
          debit: null,
          credit: feeString,
        },
      ],
    });

    const updatedOrder = await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        feeAmount: feeString,
        payoutAmount: payoutString,
        version: {
          increment: 1,
        },
      },
    });

    return {
      order: updatedOrder,
      event,
    };
  });

  return {
    idempotent: false,
    message: "Fee berhasil dihitung",
    data: result,
  };
};
