import type { FastifyInstance } from "fastify";
import { verifikasiLedge } from "../controller/ledgeController.js";

export async function legdeRoutes(app: FastifyInstance) {
  app.get("/verify-ledger/:id", verifikasiLedge);
}
