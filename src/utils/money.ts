import { Decimal } from "decimal.js";

const MONEY_SCALE = 4;
export function validateAmount(amount: string): Decimal {
  const amountRegex = /^\d+(\.\d{1,4})?$/;

  if (!amount) {
    throw new Error("data wajib diisi");
  }

  if (typeof amount !== "string") {
    throw new Error("Data harus berupa string");
  }

  if (!amountRegex.test(amount)) {
    throw new Error("data wajib berupa angka yang valid");
  }

  const money = new Decimal(amount);

  if (money.lte(0)) {
    throw new Error("nominal harus lebih dari 0!");
  }

  return money.toDecimalPlaces(MONEY_SCALE);
}

export function toMoney(value: string): Decimal {
  return validateAmount(value);
}

export function formatMoney(value: Decimal): string {
  return value.toFixed(MONEY_SCALE);
}

export function calculatedFee(amount: Decimal): Decimal {
  return amount.mul("0.03").toDecimalPlaces(MONEY_SCALE);
}

export function calculatedPayout(amount: Decimal): Decimal {
  const fee = calculatedFee(amount);
  return amount.minus(fee).toDecimalPlaces(MONEY_SCALE);
}
