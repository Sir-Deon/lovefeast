import { NextResponse } from "next/server";
import { checkAccessToken, sessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** The secure admin link: /admin/access/<ADMIN_ACCESS_TOKEN> starts a session and opens the dashboard. */
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkAccessToken(token)) return new NextResponse("Not found", { status: 404 });
  const res = NextResponse.redirect(new URL("/admin", request.url), { headers: { "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" } });
  res.cookies.set(sessionCookie());
  return res;
}
