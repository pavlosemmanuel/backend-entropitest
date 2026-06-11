import { Decimal } from "decimal.js";
import { Prisma } from "../../generated/prisma/client.js";

type mockPaymentInput = {
  orderId: string;
  amount: string;
  customerId: string;
};

export const mockProssessPayment = async (data: mockPaymentInput) => {
  const { orderId, amount, customerId } = data;

  if (!orderId || !amount || !customerId) {
    throw new Error("Data payment tidak valid");
  }

  const amountDecimal = new Decimal(amount);

  if (amountDecimal.lt(0)) {
    throw new Error("Declined");
  }

  return {
    chargeId: `mock_charge_${orderId}_${Date.now()}`,
    status: "succeeded",
  };
};
