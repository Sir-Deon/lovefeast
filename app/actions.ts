"use server";

import { redirect } from "next/navigation";
import { readDetails, startPayment } from "@/lib/registration";
import { createRegistration, getRegistration } from "@/lib/store";

export type FormState = { error?: string; values?: Record<string, string> };

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const { v, error } = readDetails(formData);
  if (error) return { error, values: v };

  const reg = await createRegistration({ ...v, createdByAdmin: false, paymentMethod: "ONLINE" });
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
