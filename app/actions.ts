"use server";

import { redirect } from "next/navigation";
import { readDetails, startPayment } from "@/lib/registration";
import { formatFee, MIN_AMOUNT } from "@/lib/config";
import { createRegistration, getRegistration } from "@/lib/store";

export type FormState = { error?: string; values?: Record<string, string> };

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const { v, error } = readDetails(formData);
  if (error) return { error, values: v };

  const amount = Number(String(formData.get("amount") ?? "").replace(/[\s\u00a0\u202f]/g, ""));
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT) {
    return { error: `Please enter a valid amount (minimum ${formatFee(MIN_AMOUNT)}).`, values: { ...v, amount: String(formData.get("amount") ?? "") } };
  }

  const reg = await createRegistration({ ...v, amount, createdByAdmin: false, paymentMethod: "ONLINE" });
  let link: string;
  try {
    link = await startPayment(reg);
  } catch (e) {
    console.error("initiate-pay failed", e);
    // Registration is saved; the invitation page lets them retry payment.
    redirect(`/invitation/${reg.id}`);
  }
  redirect(link);
}

export async function retryPayment(id: string) {
  const reg = await getRegistration(id);
  if (!reg || reg.status === "SUCCESSFUL") redirect(`/invitation/${id}`);
  let link: string;
  try {
    link = await startPayment(reg);
  } catch (e) {
    console.error("initiate-pay failed", e);
    redirect(`/invitation/${id}?error=payment`);
  }
  redirect(link);
}
