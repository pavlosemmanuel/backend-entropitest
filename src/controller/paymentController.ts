import type { FastifyReply, FastifyRequest } from "fastify";
import { recordPayment } from "../service/paymentService.js";

type PaymentParams = {
  id: string;
};

type PaymentBody = {
  amount: string;
  customerId: string;
  idempotencyKey: string;
};

export const payOrder = async (
  request: FastifyRequest<{
    Params: PaymentParams;
    Body: PaymentBody;
  }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = request.params;
    const { amount, customerId, idempotencyKey } = request.body;

    const result = await recordPayment({
      orderId: id,
      amount,
      customerId,
      paymentMethod: "debit",
      idempotencyKey,
    });

    return reply.status(200).send(result);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Internal server error",
    });
  }
};
