import { RegistrationForm } from "@/components/RegistrationForm";
import { EVENT_NAME, formatFee, onlineAmount, PASS_FAPSHI_FEE, FAPSHI_FEE_PERCENT } from "@/lib/config";

export const dynamic = "force-dynamic"; // fee comes from the env at request time

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-bark px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-cream shadow-2xl md:grid-cols-2">
        <section className="flex flex-col justify-center bg-espresso p-8 text-cream md:p-12">
          <p className="text-xs uppercase tracking-[0.35em] text-caramel">You are invited</p>
          <h1 className="font-display mt-4 text-5xl italic leading-tight md:text-6xl">{EVENT_NAME}</h1>
          <div className="my-6 h-px w-24 bg-caramel" />
          <p className="max-w-sm text-sand">
            Secure your place. Register below, pay the {formatFee(onlineAmount())} registration fee, and download your personal invitation with its unique QR code.
          </p>
        </section>
        <section className="p-8 md:p-12">
          <h2 className="font-display text-2xl">Register</h2>
          <p className="mb-6 mt-1 text-sm text-umber">Registration fee: <strong>{formatFee(onlineAmount())}</strong>{PASS_FAPSHI_FEE && <span> (includes {FAPSHI_FEE_PERCENT}% payment processing fee)</span>}</p>
          <RegistrationForm fee={formatFee(onlineAmount())} />
        </section>
      </div>
    </main>
  );
}
