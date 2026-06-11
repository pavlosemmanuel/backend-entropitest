import Fastify from "fastify";
import { request } from "node:http";
import cors from "@fastify/cors";
import { orderRoutes } from "./src/routes/order.routes.js";
import { legdeRoutes } from "./src/routes/lege.routes.js";

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: true,
});

const PORT = 5000;

await fastify.register(orderRoutes);
await fastify.register(legdeRoutes);

fastify.get("/", (request, reply) => {
  reply.send("hello world");
});

fastify.listen({ port: PORT }, () => {
  console.log("server berjalan di port", PORT);
});
