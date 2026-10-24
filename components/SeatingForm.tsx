import { assignSeating } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

export function SeatingForm({ r }: { r: { id: string; tableNumber: string | null; seatNumber: string | null } }) {
  return (
    <form action={assignSeating.bind(null, r.id)} className="flex items-center gap-1.5">
      <input name="tableNumber" defaultValue={r.tableNumber ?? ""} placeholder="Table" maxLength={20} aria-label="Table number" className="field !w-20 !px-2 !py-1.5 text-sm" />
      <input name="seatNumber" defaultValue={r.seatNumber ?? ""} placeholder="Seat" maxLength={20} aria-label="Seat number" className="field !w-20 !px-2 !py-1.5 text-sm" />
      <SubmitButton pending="…" className="btn !px-3 !py-1.5 text-sm">Save</SubmitButton>
    </form>
  );
}
