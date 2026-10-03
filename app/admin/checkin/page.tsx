import { AdminHeader } from "@/components/AdminHeader";
import { CheckIn } from "@/components/CheckIn";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckInPage({ searchParams }: PageProps<"/admin/checkin">) {
  await requireAdmin();
  const { code = "" } = await searchParams;
  return (
    <>
      <AdminHeader active="/admin/checkin" />
      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 py-6">
        <h1 className="font-display text-2xl">Check-in</h1>
        <CheckIn initialCode={String(code)} />
      </main>
    </>
  );
}
