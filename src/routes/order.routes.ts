import type { FastifyInstance } from "fastify";
import { createOrder, getOrder, getOrderbyLegde } from "../controller/orderController.js";

export async function orderRoutes(app: FastifyInstance) {
  app.post("/orders", createOrder);
  app.get("/orders/:id", getOrder);
  app.get("/orders/:id/ledger", getOrderbyLegde);
}
