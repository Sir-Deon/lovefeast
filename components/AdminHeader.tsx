import Link from "next/link";
import { logout } from "@/app/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/checkin", label: "Check-in" },
  { href: "/admin/admitted", label: "Checked in" },
  { href: "/admin/registrations", label: "Registrations" },
];

export function AdminHeader({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-10 bg-navy text-ivory shadow">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <p className="font-display text-lg italic">Love Feast</p>
        <form action={logout} className="sm:order-3">
          <button className="rounded-md border border-gold px-3 py-1.5 text-sm hover:bg-midnight">Sign out</button>
        </form>
        <nav className="flex w-full gap-1 sm:order-2 sm:w-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-medium sm:flex-none ${
                active === l.href ? "bg-gold text-midnight" : "text-mist hover:bg-midnight"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
