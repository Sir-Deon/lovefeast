import { notFound } from "next/navigation";
import { retryPayment } from "@/app/actions";
import { DownloadInvitation } from "@/components/DownloadInvitation";
import { SubmitButton } from "@/components/SubmitButton";
import { formatFee } from "@/lib/config";
import { invitationSvg } from "@/lib/invitation";
import { refreshPayment } from "@/lib/payments";
import { getRegistration } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function InvitationPage({ params, searchParams }: PageProps<"/invitation/[id]">) {
  const { id } = await params;
  const { error } = await searchParams;
  const found = await getRegistration(id);
  if (!found) notFound();
  // User is back from the payment page; don't wait on the webhook.
  const reg = await refreshPayment(found);
  const paid = reg.status === "SUCCESSFUL";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-6 px-4 py-10">
      {paid ? (
        <>
          <h1 className="font-display text-3xl">You&apos;re in, {reg.fullName.split(" ")[0]}!</h1>
          <div className="w-full max-w-sm overflow-hidden rounded-xl shadow-xl [&_svg]:block [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: await invitationSvg(reg) }} />
          <DownloadInvitation id={reg.id} svg={await invitationSvg(reg)} />
        </>
      ) : (
        <div className="w-full rounded-2xl bg-paper p-8 text-center shadow">
          <h1 className="font-display text-2xl">Payment {reg.status === "PENDING" ? "pending" : "not completed"}</h1>
          <p className="mt-2 text-umber">
            {reg.status === "PENDING" && "We haven't received confirmation yet. Refresh in a moment, or try again."}
            {reg.status === "FAILED" && "Your payment failed."}
            {reg.status === "EXPIRED" && "Your payment session expired."}
            {reg.status === "CREATED" && "Complete your payment to get your invitation."}
          </p>
          {error && <p className="mt-2 text-sm text-red-800">We couldn&apos;t start the payment. Please try again.</p>}
          <form action={retryPayment.bind(null, reg.id)} className="mt-6">
            <SubmitButton pending="Redirecting…">Pay {formatFee(reg.amount)}</SubmitButton>
          </form>
          <p className="mt-4 text-xs text-umber">Reference {reg.id}</p>
        </div>
      )}
    </main>
  );
}
