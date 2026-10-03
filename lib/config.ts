export const EVENT_NAME = "Locd & Rooted";
/** Registration fee in XAF, set with REGISTRATION_FEE in the env (default 10000). */
export const REGISTRATION_FEE = (() => {
  const raw = process.env.REGISTRATION_FEE;
  if (raw === undefined || raw === "") return 10000;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`REGISTRATION_FEE must be a positive integer, got "${raw}"`);
  return n;
})();
export const CURRENCY = "FCFA";

/** Fapshi's cut of each online payment, in percent (FAPSHI_FEE_PERCENT, default 3). */
export const FAPSHI_FEE_PERCENT = Number(process.env.FAPSHI_FEE_PERCENT ?? 3);

/** If PASS_FAPSHI_FEE=true, guests paying online are charged extra so the organiser nets the full registration fee. */
export const PASS_FAPSHI_FEE = process.env.PASS_FAPSHI_FEE === "true";

/** Amount charged to someone paying online. */
export function onlineAmount(): number {
  return PASS_FAPSHI_FEE ? Math.ceil(REGISTRATION_FEE / (1 - FAPSHI_FEE_PERCENT / 100)) : REGISTRATION_FEE;
}

/** Fapshi's fee on a given charged amount. */
export function fapshiFee(amount: number): number {
  return Math.round((amount * FAPSHI_FEE_PERCENT) / 100);
}

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function formatFee(amount = REGISTRATION_FEE): string {
  return `${amount.toLocaleString("fr-FR").replace(/ | /g, " ")} ${CURRENCY}`;
}
