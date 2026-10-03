import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { AdmittedBadge, STATUSES, StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import { listRegistrations, type Registration } from "@/lib/store";
import { markPaidCash, removeRegistration } from "../actions";

export const dynamic = "force-dynamic";

function Actions({ r }: { r: Registration }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <Link href={`/invitation/${r.id}`} target="_blank" className="font-medium underline">Invitation</Link>
      {r.status !== "SUCCESSFUL" && (
        <form action={markPaidCash.bind(null, r.id)}><SubmitButton className="font-medium underline">Mark paid</SubmitButton></form>
      )}
      <form action={removeRegistration.bind(null, r.id)}><SubmitButton className="font-medium text-red-800 underline">Delete</SubmitButton></form>
    </div>
  );
}

export default async function RegistrationsPage({ searchParams }: PageProps<"/admin/registrations">) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;
  const query = String(q).toLowerCase();
  const all = await listRegistrations();
  const rows = all.filter(
    (r) =>
      (!status || r.status === status) &&
      (!query || [r.fullName, r.email, r.phone, r.whatsapp, r.id].some((f) => f.toLowerCase().includes(query))),
  );
  const fmt = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <AdminHeader active="/admin/registrations" />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-6">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-2xl">Registrations</h1>
          <p className="text-sm text-umber">{rows.length} of {all.length}</p>
        </div>

        <form className="grid grid-cols-2 gap-2 sm:flex">
          <input name="q" defaultValue={q} placeholder="Search name, email, phone, ID" className="field col-span-2 sm:max-w-xs" />
          <select name="status" defaultValue={status} className="field sm:max-w-[11rem]">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn">Filter</button>
        </form>

        {/* Phones: cards */}
        <ul className="space-y-3 md:hidden">
          {rows.map((r) => (
            <li key={r.id} className="space-y-3 rounded-2xl bg-paper p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{r.fullName}</p>
                  <p className="font-mono text-xs text-umber">{r.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1"><StatusBadge status={r.status} />{r.admittedAt && <AdmittedBadge />}</div>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-umber">Email</dt><dd className="break-all">{r.email}</dd>
                <dt className="text-umber">Phone</dt><dd><a href={`tel:${r.phone}`}>{r.phone}</a></dd>
                <dt className="text-umber">WhatsApp</dt><dd><a href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`} target="_blank">{r.whatsapp}</a></dd>
                <dt className="text-umber">Via</dt><dd>{r.paymentMethod}{r.createdByAdmin && " · admin"}</dd>
                <dt className="text-umber">Date</dt><dd>{fmt(r.createdAt)}</dd>
              </dl>
              <Actions r={r} />
            </li>
          ))}
        </ul>

        {/* Tablets and up: table */}
        <div className="hidden overflow-x-auto rounded-2xl bg-paper shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-sand text-xs uppercase tracking-wider text-umber">
              <tr>{["ID", "Name", "Email", "Phone", "WhatsApp", "Status", "Via", "Registered", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-sand align-top">
                  <td className="px-4 py-3 font-mono">{r.id}</td>
                  <td className="px-4 py-3 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.phone}</td>
                  <td className="px-4 py-3">{r.whatsapp}</td>
                  <td className="space-y-1 px-4 py-3"><StatusBadge status={r.status} />{r.admittedAt && <div><AdmittedBadge /></div>}</td>
                  <td className="px-4 py-3">{r.paymentMethod}{r.createdByAdmin && " · admin"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{fmt(r.createdAt)}</td>
                  <td className="px-4 py-3"><Actions r={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && <p className="rounded-2xl bg-paper p-8 text-center text-umber">No registrations found.</p>}
      </main>
    </>
  );
}
