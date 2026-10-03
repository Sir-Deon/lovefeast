"use client";

import { useActionState } from "react";
import { adminRegister, type AdminState } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

export function AdminRegisterForm() {
  const [state, action] = useActionState<AdminState, FormData>(adminRegister, {});
  return (
    <form action={action} className="grid gap-3 rounded-2xl bg-paper p-4 shadow-sm sm:p-5 md:grid-cols-2">
      <h2 className="font-display text-xl md:col-span-2">Register someone</h2>
      <input name="fullName" required placeholder="Full name" className="field" />
      <input name="email" type="email" required placeholder="Email" className="field" />
      <input name="phone" type="tel" required placeholder="Phone" className="field" />
      <input name="whatsapp" type="tel" required placeholder="WhatsApp number" className="field" />
      <select name="payment" className="field" defaultValue="CASH">
        <option value="CASH">Paid in cash / already paid</option>
        <option value="ONLINE">Send online payment link</option>
      </select>
      <div className="md:col-span-2">
        <SubmitButton pending="Saving…">Register</SubmitButton>
      </div>
      {state.error && <p role="alert" className="text-sm text-red-800 md:col-span-2">{state.error}</p>}
      {state.ok && (
        <p className="break-all text-sm text-umber md:col-span-2">
          {state.ok} {state.link && <a href={state.link} className="underline" target="_blank">{state.link}</a>}
        </p>
      )}
    </form>
  );
}
