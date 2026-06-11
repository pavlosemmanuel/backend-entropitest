import { version } from "node:os";
import { prisma } from "../lib/prisma.js";
import { formatMoney, toMoney, validateAmount } from "../utils/money.js";
import { fa } from "zod/locales";

type CreateOrderInput = {
  orderId: string;
  amount: string;
  customerId: string;
  paymentMethod: string;
  idempotencyKey: string;
};

export const recordOrder = async (data: CreateOrderInput) => {
  const { orderId, amount, customerId, paymentMethod, idempotencyKey } = data;

  const existingOrder = await prisma.eventLogModels.findUnique({
    where: {
      idempotencyKey,
    },
  });

  const money = validateAmount(amount);
  const moneyString = formatMoney(money);

  if (existingOrder) {
    return {
      idempotencyKey: true,
      message: "Order sudah pernah dibuat",
      existingOrder,
    };
  }

  const result = await prisma.$transaction(async (databaseData) => {
    const order = await databaseData.order.create({
      data: {
        id: orderId,
        customerId,
        amount: moneyString,
        paymentMethod,
        paymentStatus: "pending",
        orderStatus: "created",
        version: 1,
      },
    });

    const event = await databaseData.eventLogModels.create({
      data: {
        aggregateId: orderId,
        eventType: "OrderCreated",
        payload: {
          orderId,
          customerId,
          amount: moneyString,
          paymentMethod,
        },
        version: "1",
        idempotencyKey,
      },
    });

    await databaseData.ledgerModels.createMany({
      data: [
        {
          orderId,
          account: "balanceOrder",
          debit: moneyString,
          credit: null,
        },
        {
          orderId,
          account: "pendingOrder",
          debit: null,
          credit: moneyString,
        },
      ],
    });

    return {
      order,
      event,
    };
  });

  return {
    idempotencyKey: false,
    msg: "order berhasil dibuat",
    data: result,
  };
};

export const getOrderById = async (orderId: string) => {
  const getOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!getOrder) {
    throw new Error("Order tidak valid");
  }

  return getOrder;
};
