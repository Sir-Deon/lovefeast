import { appUrl } from "./config";
import type { PaymentStatus } from "./store";

const BASE = process.env.FAPSHI_BASE_URL ?? "https://sandbox.fapshi.com";

function headers() {
  const apikey = process.env.FAPSHI_API_KEY;
  const apiuser = process.env.FAPSHI_API_USER;
  if (!apikey || !apiuser) throw new Error("FAPSHI_API_KEY / FAPSHI_API_USER not set");
  return { "Content-Type": "application/json", apikey, apiuser };
}

export async function initiatePay(reg: { id: string; email: string; amount: number }) {
  const res = await fetch(`${BASE}/initiate-pay`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      amount: reg.amount,
      email: reg.email,
      redirectUrl: `${appUrl()}/invitation/${reg.id}`,
      userId: reg.id,
      externalId: reg.id,
      message: "Love Feast registration",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.link) {
    throw new Error(data.message ?? `Fapshi error ${res.status}`);
  }
  return { link: data.link as string, transId: data.transId as string };
}

const STATUSES: PaymentStatus[] = ["CREATED", "PENDING", "SUCCESSFUL", "FAILED", "EXPIRED"];

export function parseStatus(value: unknown): PaymentStatus | undefined {
  const s = String(value ?? "").toUpperCase();
  return STATUSES.find((x) => x === s);
}

/** Authoritative status lookup; used to verify webhooks and on return from payment. */
export async function fetchStatus(transId: string) {
  const res = await fetch(`${BASE}/payment-status/${encodeURIComponent(transId)}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return {
    status: parseStatus(data.status),
    externalId: data.externalId as string | undefined,
    amount: Number(data.amount),
  };
}

/** Current Fapshi account balance, or undefined if it can't be fetched. */
export async function fetchBalance() {
  try {
    const res = await fetch(`${BASE}/balance`, { headers: headers(), cache: "no-store" });
    if (!res.ok) return undefined;
    const data = await res.json();
    const balance = Number(data.balance);
    if (!Number.isFinite(balance)) return undefined;
    return { balance, currency: String(data.currency ?? "XAF"), service: data.service as string | undefined };
  } catch {
    return undefined;
  }
}
