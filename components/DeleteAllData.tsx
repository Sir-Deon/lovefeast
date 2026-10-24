"use client";

import { useActionState } from "react";
import { deleteAllData, type AdminState } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

export function DeleteAllData({ count }: { count: number }) {
  const [state, action] = useActionState<AdminState, FormData>(deleteAllData, {});
  return (
    <section className="rounded-2xl border border-red-800/40 bg-linen p-5">
      <h2 className="font-display text-xl text-red-800">Danger zone</h2>
      <p className="mt-1 text-sm text-slate">
        Permanently delete all {count} registration{count === 1 ? "" : "s"}, including payments and check-in records. This cannot be undone.
      </p>
      <form action={action} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input name="confirm" required autoComplete="off" placeholder="Type DELETE to confirm" className="field sm:max-w-xs" />
        <SubmitButton pending="Deleting…" className="btn !bg-red-800 hover:!bg-red-900">Delete all data</SubmitButton>
      </form>
      {state.error && <p role="alert" className="mt-2 text-sm text-red-800">{state.error}</p>}
      {state.ok && <p role="status" className="mt-2 text-sm text-slate">{state.ok}</p>}
    </section>
  );
}
