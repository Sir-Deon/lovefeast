"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { admitGuest, lookupGuest, type Guest } from "@/app/admin/actions";

type Result = { guest: Guest | null; admitted?: boolean; raced?: boolean } | null;

export function CheckIn({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<Result>(null);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState("");
  const [pending, start] = useTransition();
  const video = useRef<HTMLVideoElement>(null);

  const lookup = useCallback(
    (value: string) =>
      start(async () => {
        setResult({ guest: await lookupGuest(value) });
      }),
    [],
  );

  useEffect(() => {
    if (initialCode) lookup(initialCode);
  }, [initialCode, lookup]);

  // Camera scanning loop
  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | undefined;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const tick = () => {
      const v = video.current;
      if (stopped || !v) return;
      if (v.readyState === v.HAVE_ENOUGH_DATA) {
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        ctx.drawImage(v, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hit = jsQR(img.data, img.width, img.height);
        if (hit && /L[RF]-[A-Z0-9]{8}/i.test(hit.data)) {
          setCode(hit.data.match(/L[RF]-[A-Z0-9]{8}/i)![0].toUpperCase());
          setScanning(false);
          lookup(hit.data);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        if (stopped) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        video.current!.srcObject = s;
        return video.current!.play().then(tick);
      })
      .catch(() => {
        setCamError("Couldn't open the camera. Allow camera access (needs HTTPS or localhost), or type the code instead.");
        setScanning(false);
      });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning, lookup]);

  const g = result?.guest;
  const tone = !result ? "" : !g || g.admittedAt ? "bg-[#8a2f16]" : !g.paid ? "bg-[#9a6a10]" : "bg-[#3f5a24]";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-linen p-4 shadow-sm sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCamError("");
            lookup(code);
          }}
          className="flex gap-2"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Invitation code, e.g. LF-7K2M9QXA"
            autoCapitalize="characters"
            autoComplete="off"
            className="field font-mono uppercase"
          />
          <button className="btn" disabled={pending || !code.trim()}>Find</button>
        </form>
        <button
          type="button"
          onClick={() => { setCamError(""); setResult(null); setScanning((s) => !s); }}
          className="btn btn-ghost mt-3 w-full"
        >
          {scanning ? "Stop camera" : "Scan QR code with camera"}
        </button>
        {camError && <p className="mt-2 text-sm text-red-800">{camError}</p>}
        {scanning && (
          <div className="relative mt-3 overflow-hidden rounded-xl bg-black">
            <video ref={video} playsInline muted className="aspect-square w-full object-cover" />
            <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-gold" />
          </div>
        )}
      </div>

      {result && (
        <div className={`space-y-3 rounded-2xl p-6 text-center text-ivory shadow ${tone}`}>
          {!g ? (
            <>
              <p className="text-4xl">✕</p>
              <h2 className="font-display text-2xl">Invitation not found</h2>
            </>
          ) : (
            <>
              <p className="text-4xl">{result.admitted ? "✓" : g.admittedAt ? "✕" : !g.paid ? "!" : "•"}</p>
              <h2 className="font-display text-2xl">{g.fullName}</h2>
              <p className="font-mono text-sm opacity-90">{g.id}</p>
              <p className="text-sm opacity-90">{g.email} · {g.phone}</p>
              <p className="text-lg font-semibold">{g.tableNumber || g.seatNumber ? `Table ${g.tableNumber ?? "—"} · Seat ${g.seatNumber ?? "—"}` : "No seat assigned"}</p>
              {result.admitted ? (
                <p className="text-lg font-semibold">Admitted — welcome!</p>
              ) : g.admittedAt ? (
                <p className="text-lg font-semibold">TICKET ALREADY USED<br /><span className="text-sm font-normal">Admitted {new Date(g.admittedAt).toLocaleString("en-GB")}</span></p>
              ) : !g.paid ? (
                <p className="text-lg font-semibold">Payment not confirmed ({g.status})</p>
              ) : (
                <button
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await admitGuest(g.id);
                      setResult({ guest: r.guest, admitted: r.ok });
                    })
                  }
                  className="w-full rounded-lg bg-ivory py-3.5 text-lg font-bold text-navy disabled:opacity-60"
                >
                  {pending ? "Admitting…" : "Admit"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
