import { fetchStatus } from "./fapshi";
import { Registration, updateRegistration, type PaymentStatus } from "./store";

export function applyStatus(reg: Registration, status: PaymentStatus) {
  // Never downgrade a completed payment (webhooks can arrive out of order).
  if (reg.status === "SUCCESSFUL") return reg;
  return updateRegistration(reg.id, {
    status,
    ...(status === "SUCCESSFUL" ? { paidAt: new Date() } : {}),
  });
}

/** Re-check an unfinished online payment with Fapshi and persist the result. */
export async function refreshPayment(reg: Registration): Promise<Registration> {
  if (reg.paymentMethod !== "ONLINE" || !reg.transId) return reg;
  if (reg.status === "SUCCESSFUL" || reg.status === "FAILED" || reg.status === "EXPIRED") return reg;
  try {
    const remote = await fetchStatus(reg.transId);
    if (!remote?.status || remote.status === reg.status) return reg;
    if (remote.status === "SUCCESSFUL" && remote.amount < reg.amount) return reg;
    return (await applyStatus(reg, remote.status)) ?? reg;
  } catch {
    return reg;
  }
}
