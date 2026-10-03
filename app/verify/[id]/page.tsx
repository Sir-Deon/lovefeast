import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getRegistration } from "@/lib/store";

export const dynamic = "force-dynamic";

// Opened by scanning the QR on an invitation.
export default async function Verify({ params }: PageProps<"/verify/[id]">) {
  const { id } = await params;
  const reg = await getRegistration(id);
  const paid = reg?.status === "SUCCESSFUL";
  const used = !!reg?.admittedAt;
  const admin = await isAdmin();
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className={`w-full max-w-sm rounded-2xl p-8 text-center text-cream ${paid && !used ? "bg-[#3f5a24]" : "bg-[#8a2f16]"}`}>
        <p className="text-5xl">{paid && !used ? "✓" : "✕"}</p>
        <h1 className="font-display mt-3 text-2xl">{!reg ? "Invitation not found" : used ? "Ticket already used" : paid ? "Payment confirmed" : "Payment not confirmed"}</h1>
        {reg && <p className="mt-2 text-lg">{reg.fullName}</p>}
        <p className="mt-1 font-mono text-sm opacity-80">{id}</p>
        {reg?.admittedAt && <p className="mt-3 text-sm">Admitted {reg.admittedAt.toLocaleString("en-GB")}</p>}
        {admin && reg && (
          <Link href={`/admin/checkin?code=${id}`} className="mt-5 block rounded-lg bg-cream py-3 font-bold text-bark">
            Open check-in
          </Link>
        )}
      </div>
    </main>
  );
}
