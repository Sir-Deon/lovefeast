"use client";

import { useActionState } from "react";
import { login, type AdminState } from "../actions";
import { SubmitButton } from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, action] = useActionState<AdminState, FormData>(login, {});
  return (
    <main className="flex flex-1 items-center justify-center bg-bark px-4 py-8">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-cream p-8 shadow-2xl">
        <h1 className="font-display text-2xl">Admin</h1>
        <input name="password" type="password" required autoFocus placeholder="Password" className="field" />
        {state.error && <p role="alert" className="text-sm text-red-800">{state.error}</p>}
        <SubmitButton pending="Signing in…">Sign in</SubmitButton>
      </form>
    </main>
  );
}
