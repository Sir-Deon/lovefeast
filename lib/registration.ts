import { initiatePay } from "./fapshi";
import { updateRegistration } from "./store";

export function readDetails(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const v = { fullName: get("fullName"), email: get("email").toLowerCase(), phone: get("phone"), whatsapp: get("whatsapp") };
  let error: string | undefined;
  if (v.fullName.length < 2) error = "Please enter your full name.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) error = "Please enter a valid email.";
  else if (v.phone.replace(/\D/g, "").length < 8) error = "Please enter a valid phone number.";
  else if (v.whatsapp.replace(/\D/g, "").length < 8) error = "Please enter a valid WhatsApp number.";
  return { v, error };
}

/** Creates (or retries) the online payment for a registration and returns the checkout URL. */
export async function startPayment(reg: { id: string; email: string; amount: number }) {
  const { link, transId } = await initiatePay(reg);
  await updateRegistration(reg.id, { transId, paymentLink: link, status: "PENDING" });
  return link;
}
