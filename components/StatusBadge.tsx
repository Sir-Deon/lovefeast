const badge: Record<string, string> = {
  SUCCESSFUL: "bg-[#dfe9cf] text-[#33491c]",
  PENDING: "bg-[#f4e2b8] text-[#6b4a05]",
  CREATED: "bg-sand text-umber",
  FAILED: "bg-[#f1cfc6] text-[#7a2410]",
  EXPIRED: "bg-[#e0d6cc] text-[#5c4a3a]",
};

export function AdmittedBadge() {
  return <span className="rounded-full bg-bark px-2.5 py-1 text-xs font-semibold text-cream">ADMITTED</span>;
}

export const STATUSES = Object.keys(badge);

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge[status]}`}>{status}</span>;
}
