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

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function formatFee(amount = REGISTRATION_FEE): string {
  return `${amount.toLocaleString("fr-FR").replace(/ | /g, " ")} ${CURRENCY}`;
}
