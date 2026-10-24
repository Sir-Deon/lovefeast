"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin } from "@/lib/auth";
import { admitRegistration, createRegistration, deleteAllRegistrations, deleteRegistration, getRegistration, updateRegistration } from "@/lib/store";
import { readDetails, startPayment } from "@/lib/registration";

export type AdminState = { error?: string; ok?: string; link?: string };

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/** Admin registers someone: either already paid (cash) or with an online payment link to share. */
export async function adminRegister(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const { v, error } = readDetails(formData);
  if (error) return { error };
  const cash = formData.get("payment") === "CASH";
  const reg = await createRegistration({
    ...v,
    createdByAdmin: true,
    paymentMethod: cash ? "CASH" : "ONLINE",
    status: cash ? "SUCCESSFUL" : "CREATED",
  });
  revalidatePath("/admin", "layout");
  if (cash) return { ok: `${reg.fullName} registered (cash). Invitation ${reg.id}.` };
  try {
    const link = await startPayment(reg);
    return { ok: `${reg.fullName} registered (${reg.id}). Share this payment link:`, link };
  } catch {
    return { ok: `${reg.fullName} registered (${reg.id}), but the payment link couldn't be created. Use "Pay" from their invitation page.` };
  }
}

export async function markPaidCash(id: string) {
  await requireAdmin();
  const reg = await getRegistration(id);
  if (reg && reg.status !== "SUCCESSFUL") {
    await updateRegistration(id, { status: "SUCCESSFUL", paymentMethod: "CASH", paidAt: new Date() });
  }
  revalidatePath("/admin", "layout");
}

export async function removeRegistration(id: string) {
  await requireAdmin();
  await deleteRegistration(id);
  revalidatePath("/admin", "layout");
}

/** Wipes every registration. The admin must type DELETE to confirm. */
export async function deleteAllData(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  if (String(formData.get("confirm") ?? "").trim() !== "DELETE") return { error: "Type DELETE to confirm." };
  const count = await deleteAllRegistrations();
  revalidatePath("/admin", "layout");
  return { ok: `Deleted ${count} registration${count === 1 ? "" : "s"}.` };
}

export type Guest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  paid: boolean;
  status: string;
  admittedAt: string | null;
};

/** Accepts a bare code (LR-XXXXXXXX) or the full URL from the QR. */
export async function lookupGuest(input: string): Promise<Guest | null> {
  await requireAdmin();
  const id = /LR-[A-Z0-9]{8}/.exec(input.toUpperCase())?.[0];
  const reg = id ? await getRegistration(id) : undefined;
  if (!reg) return null;
  return {
    id: reg.id,
    fullName: reg.fullName,
    email: reg.email,
    phone: reg.phone,
    paid: reg.status === "SUCCESSFUL",
    status: reg.status,
    admittedAt: reg.admittedAt?.toISOString() ?? null,
  };
}

export async function admitGuest(id: string): Promise<{ ok: boolean; guest: Guest | null }> {
  await requireAdmin();
  const ok = await admitRegistration(id);
  revalidatePath("/admin", "layout");
  return { ok, guest: await lookupGuest(id) };
}
