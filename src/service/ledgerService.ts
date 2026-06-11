import Decimal from "decimal.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { timeStamp } from "node:console";
import { never } from "zod";

export const getOrderLedger = async (id: string) => {
  const ledger = await prisma.ledgerModels.findMany({
    where: {
      id,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  return ledger;
};

export const verifyLedgerBalance = async (orderId: string) => {
  const ledgerExist = await prisma.ledgerModels.findMany({
    where: {
      orderId,
    },
  });

  if (!ledgerExist || ledgerExist.length == 0) {
    throw new Error("data ini tidak  ditemukan");
  }

  const totalDebit = ledgerExist.reduce((sum, entry) => {
    const value = entry.debit ? entry.debit.toString() : "0";
    return sum.plus(value);
  }, new Prisma.Decimal(0));

  const totalCredit = ledgerExist.reduce((sum, entry) => {
    const value = entry.credit ? entry.credit.toString() : "0";

    return sum.plus(value);
  }, new Prisma.Decimal(0));

  const totals = totalDebit.minus(totalCredit);

  return {
    orderId,
    totalDebit: totalDebit.toFixed(4),
    totalCredit: totalCredit.toFixed(4),
    totals: totals.toFixed(4),
    balance: totals.eq(0),
  };
};
