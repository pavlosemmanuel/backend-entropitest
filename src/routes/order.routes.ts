import type { FastifyInstance } from "fastify";
import { createOrder, getOrder, getOrderbyLegde } from "../controller/orderController.js";
import { payOrder } from "../controller/paymentController.js";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/orders", createOrder);
  app.get("/orders/:id", getOrder);
  app.get("/orders/:id/ledger", getOrderbyLegde);
  app.post("/orders/:id/pay", payOrder);
}
