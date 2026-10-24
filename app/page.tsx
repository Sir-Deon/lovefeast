import Image from "next/image";
import { RegistrationForm } from "@/components/RegistrationForm";
import { EVENT_NAME, MIN_AMOUNT, formatFee, onlineAmount, PASS_FAPSHI_FEE, FAPSHI_FEE_PERCENT } from "@/lib/config";

export const dynamic = "force-dynamic"; // fee comes from the env at request time

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-navy px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-ivory shadow-2xl md:grid-cols-2">
        <section className="flex flex-col justify-center bg-midnight p-8 text-ivory md:p-12">
          <Image src="/LGN_Logo-White.png" alt="LGN" width={680} height={338} priority className="mb-8 h-auto w-40" />
          <p className="text-xs uppercase tracking-[0.35em] text-gold">You are invited to fellowship</p>
          <h1 className="font-display mt-4 text-5xl italic leading-tight md:text-6xl">{EVENT_NAME}</h1>
          <div className="my-6 h-px w-24 bg-gold" />
          <p className="max-w-sm text-mist">
            Come break bread and share in fellowship. Register below, choose your amount (the registration fee is {formatFee(onlineAmount())}), and download your personal invitation with its unique QR code.
          </p>
        </section>
        <section className="p-8 md:p-12">
          <h2 className="font-display text-2xl">Register</h2>
          <p className="mb-6 mt-1 text-sm text-slate">Suggested amount: <strong>{formatFee(onlineAmount())}</strong>{PASS_FAPSHI_FEE && <span> (includes {FAPSHI_FEE_PERCENT}% payment processing fee)</span>}</p>
          <RegistrationForm amount={onlineAmount()} min={MIN_AMOUNT} />
        </section>
      </div>
    </main>
  );
}
