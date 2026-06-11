import { request } from "node:http";
import { recordOrder, getOrderById } from "../service/recordOrder.js";
import { getOrderLedger } from "../service/ledgerService.js";

type orderInterface = {
  orderId: string;
  amount: string;
  customerId: string;
  paymentMethod: string;
  idempotencyKey: string;
};

type OrderParams = {
  id: string;
};

export const createOrder = async (request: any, reply: any) => {
  try {
    const body = request.body as orderInterface;

    const result = await recordOrder(body);

    return reply.status(200).send({
      msg: "berhasil membuat order",
      data: result,
    });
  } catch (error) {
    return reply.status(400).send({
      msg: "gagal membuat order",
      Error: error,
    });
  }
};

export const getOrder = async (request: any, reply: any) => {
  try {
    const { id } = request.params;

    const orderExist = await getOrderById(id);

    return reply.status(200).send({
      msg: " data berhasil diambil",
      orderExist,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Internal server error",
    });
  }
};

export const getOrderbyLegde = async (request: any, reply: any) => {
  try {
    const { id } = request.params;
    const leadger = await getOrderLedger(id);

    return reply.status(200).send({
      msg: "get leadger ditemukan",
      data: leadger,
    });
  } catch (error) {
    return reply.status(400).send({
      message: error,
    });
  }
};
