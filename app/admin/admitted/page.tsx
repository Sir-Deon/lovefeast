import { AdminHeader } from "@/components/AdminHeader";
import { requireAdmin } from "@/lib/auth";
import { listRegistrations } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdmittedPage({ searchParams }: PageProps<"/admin/admitted">) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const query = String(q).toLowerCase();
  const all = await listRegistrations();
  const paid = all.filter((r) => r.status === "SUCCESSFUL");
  const admitted = all
    .filter((r) => r.admittedAt)
    .sort((a, b) => b.admittedAt!.getTime() - a.admittedAt!.getTime());
  const rows = admitted.filter(
    (r) => !query || [r.fullName, r.email, r.phone, r.whatsapp, r.id].some((f) => f.toLowerCase().includes(query)),
  );
  const fmt = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <>
      <AdminHeader active="/admin/admitted" />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <div className="flex items-baseline justify-between">
          <h1 className="font-display text-2xl">Checked in</h1>
          <p className="text-sm text-umber">
            <strong>{admitted.length}</strong> of {paid.length} paid guests
          </p>
        </div>

        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search name, email, phone, ID" className="field" />
          <button className="btn">Search</button>
        </form>

        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-sm">
              <span className="w-8 shrink-0 text-center text-sm text-umber">{admitted.length - admitted.indexOf(r)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{r.fullName}</p>
                <p className="truncate text-sm text-umber">{r.phone} · <span className="font-mono">{r.id}</span></p>
              </div>
              <p className="shrink-0 text-right text-sm">{fmt(r.admittedAt!)}</p>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="rounded-2xl bg-paper p-8 text-center text-umber">No one has checked in{query && " matching that search"}.</li>
          )}
        </ul>
      </main>
    </>
  );
}
