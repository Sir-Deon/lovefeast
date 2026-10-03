import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminRegisterForm } from "@/components/AdminRegisterForm";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { formatFee } from "@/lib/config";
import { listRegistrations } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const all = await listRegistrations();
  const paid = all.filter((r) => r.status === "SUCCESSFUL");
  const stats: [string, string | number][] = [
    ["Registered", all.length],
    ["Paid", paid.length],
    ["Admitted", `${all.filter((r) => r.admittedAt).length} / ${paid.length}`],
    ["Collected", formatFee(paid.reduce((sum, r) => sum + r.amount, 0))],
  ];

  return (
    <>
      <AdminHeader active="/admin" />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-bark p-4 text-cream">
              <p className="text-[11px] uppercase tracking-widest text-caramel">{l}</p>
              <p className="font-display mt-1 text-xl sm:text-2xl">{v}</p>
            </div>
          ))}
        </div>

        <AdminRegisterForm />

        <section className="rounded-2xl bg-paper p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl">Latest registrations</h2>
            <Link href="/admin/registrations" className="text-sm font-medium underline">View all →</Link>
          </div>
          <ul className="divide-y divide-sand">
            {all.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.fullName}</p>
                  <p className="font-mono text-xs text-umber">{r.id}</p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
            {all.length === 0 && <li className="py-4 text-center text-umber">No registrations yet.</li>}
          </ul>
        </section>
      </main>
    </>
  );
}
