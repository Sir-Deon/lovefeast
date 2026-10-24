"use client";

import { useActionState } from "react";
import { register, type FormState } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

export function RegistrationForm({ amount, min }: { amount: number; min: number }) {
  const [state, action] = useActionState<FormState, FormData>(register, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate">Full name</span>
        <input name="fullName" required autoComplete="name" defaultValue={v.fullName} className="field" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate">Email</span>
        <input name="email" type="email" required autoComplete="email" defaultValue={v.email} className="field" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate">Phone (Mobile Money number)</span>
        <input name="phone" type="tel" required autoComplete="tel" placeholder="6XX XXX XXX" defaultValue={v.phone} className="field" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate">WhatsApp number</span>
        <input name="whatsapp" type="tel" required placeholder="6XX XXX XXX" defaultValue={v.whatsapp} className="field" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate">Amount (FCFA)</span>
        <input name="amount" type="number" inputMode="numeric" required min={min} step={1} defaultValue={v.amount ?? amount} className="field" />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-800">{state.error}</p>}
      <SubmitButton pending="Redirecting to payment…">Register & pay</SubmitButton>
      <p className="text-xs text-slate">You&apos;ll be redirected to our secure payment partner. Your invitation is ready right after payment.</p>
    </form>
  );
}
