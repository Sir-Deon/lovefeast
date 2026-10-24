import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "lr_admin";
const MAX_AGE = 60 * 60 * 12;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET not set");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The secret in the admin link (ADMIN_ACCESS_TOKEN). Must be long enough to be unguessable. */
export function checkAccessToken(input: string): boolean {
  const token = process.env.ADMIN_ACCESS_TOKEN;
  return !!token && token.length >= 24 && safeEqual(input, token);
}

/** Name, value and options of a fresh session cookie. */
export function sessionCookie() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return {
    name: COOKIE,
    value: `${exp}.${sign(exp)}`,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  return !!exp && !!sig && safeEqual(sig, sign(exp)) && Number(exp) > Date.now();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
