import { fetchStatus, parseStatus } from "@/lib/fapshi";
import { applyStatus } from "@/lib/payments";
import { getByTransId, getRegistration } from "@/lib/store";

// Configure this URL (APP_URL/api/webhook/fapshi) as the webhook in the Fapshi dashboard.
// Payload: { transId, status, externalId, amount, ... } with status
// CREATED | PENDING | SUCCESSFUL | FAILED | EXPIRED.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const transId = body?.transId ? String(body.transId) : undefined;
  if (!transId) return Response.json({ error: "transId missing" }, { status: 400 });

  const reg =
    (await getByTransId(transId)) ??
    (body.externalId ? await getRegistration(String(body.externalId)) : undefined);
  if (!reg) return Response.json({ ok: true, ignored: true }); // 200 so Fapshi doesn't retry

  // The webhook is unauthenticated, so confirm the status with Fapshi directly.
  let status = parseStatus(body.status);
  try {
    const remote = await fetchStatus(transId);
    if (remote?.status) status = remote.status;
    else if (!remote) status = undefined;
  } catch (e) {
    console.error("webhook verification failed", e);
    return Response.json({ error: "verification failed" }, { status: 502 });
  }
  if (!status) return Response.json({ error: "unverified" }, { status: 400 });

  await applyStatus({ ...reg, transId }, status);
  return Response.json({ ok: true, status });
}

export async function GET() {
  return Response.json({ ok: true, webhook: "fapshi" });
}
