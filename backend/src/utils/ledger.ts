/**
 * LEDGER UTILITY - Fintech-Grade Balance Accounting
 * Balance = SUM(immutable ledger entries)
 */

import { Decimal } from "decimal.js";
import prisma from "../prismaClient";
import { logger } from "./logger";

export type LedgerEntryType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "WITHDRAWAL_HOLD"
  | "WITHDRAWAL_RELEASE"
  | "WITHDRAWAL_COMPLETE"
  | "FEE"
  | "ADJUSTMENT"
  | "CREDIT"
  | "DEDUCTION"
  | "REFUND";

export interface AddLedgerEntryParams {
  userId: string;
  currency: string;
  amount: Decimal | string | number;
  type: LedgerEntryType;
  referenceId?: string;
  createdBy: string;
  reason?: string;
  idempotencyKey?: string;
}

export async function getOrCreateAccount(userId: string, currency: string) {
  return prisma.user_crypto_balances.upsert({
    where: { userId_currency: { userId, currency } },
    update: {},
    create: {
      id: `bal-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      currency,
      balance: new Decimal(0),
      updatedAt: new Date(),
    },
  });
}

export async function addLedgerEntry(params: AddLedgerEntryParams) {
  const amount = new Decimal(params.amount);

  await getOrCreateAccount(params.userId, params.currency);

  const entry = await prisma.crypto_ledger.create({
    data: {
      id: `ledger-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: params.userId,
      currency: params.currency,
      amount,
      type: params.type,
      txHash: params.referenceId,
      actorId: params.createdBy.startsWith("admin:")
        ? params.createdBy.replace("admin:", "")
        : params.userId,
      status: "APPROVED",
      createdAt: new Date(),
    },
  });

  logger.info(`Ledger: ${entry.id} | ${params.type} | ${amount} ${params.currency}`);
  return entry;
}

export async function getBalanceFromLedger(userId: string, currency: string) {
  const entries = await prisma.crypto_ledger.findMany({
    where: { userId, currency, status: "APPROVED" },
    select: { amount: true, type: true, createdAt: true },
  });

  let balance = new Decimal(0);
  let held = new Decimal(0);
  let lastUpdated = new Date(0);

  for (const e of entries) {
    balance = balance.plus(e.amount);
    if (e.type === "WITHDRAWAL_HOLD") held = held.plus(e.amount.abs());
    else if (["WITHDRAWAL_RELEASE", "WITHDRAWAL_COMPLETE"].includes(e.type))
      held = held.minus(e.amount.abs());
    if (e.createdAt > lastUpdated) lastUpdated = e.createdAt;
  }

  if (held.isNegative()) held = new Decimal(0);

  return { userId, currency, balance, availableBalance: balance.minus(held), heldBalance: held, lastUpdated };
}

export async function getBalance(userId: string, currency: string): Promise<Decimal> {
  const result = await getBalanceFromLedger(userId, currency);
  return result.availableBalance;
}

export async function holdFunds(params: {
  userId: string;
  currency: string;
  amount: Decimal | string | number;
  referenceId: string;
  createdBy: string;
}) {
  const amount = new Decimal(params.amount);
  const balance = await getBalance(params.userId, params.currency);
  if (balance.lessThan(amount)) {
    throw new Error(`Insufficient balance: has ${balance}, needs ${amount}`);
  }

  await addLedgerEntry({
    userId: params.userId,
    currency: params.currency,
    amount: amount.negated(),
    type: "WITHDRAWAL_HOLD",
    referenceId: params.referenceId,
    createdBy: params.createdBy,
  });
}

export async function releaseFunds(params: {
  userId: string;
  currency: string;
  amount: Decimal | string | number;
  referenceId: string;
  createdBy: string;
  reason: string;
}) {
  await addLedgerEntry({
    userId: params.userId,
    currency: params.currency,
    amount: new Decimal(params.amount),
    type: "WITHDRAWAL_RELEASE",
    referenceId: params.referenceId,
    createdBy: params.createdBy,
    reason: params.reason,
  });
}

export default { getOrCreateAccount, addLedgerEntry, getBalance, getBalanceFromLedger, holdFunds, releaseFunds };
