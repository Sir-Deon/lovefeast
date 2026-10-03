import QRCode from "qrcode";
import { appUrl, EVENT_NAME, formatFee } from "./config";
import type { Registration } from "./store";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** The QR opens the verification page, so staff can scan it to confirm payment at the door. */
export async function invitationSvg(reg: Registration): Promise<string> {
  const qr = await QRCode.toString(`${appUrl()}/verify/${reg.id}`, {
    type: "svg",
    margin: 0,
    color: { dark: "#3b2314", light: "#00000000" },
    errorCorrectionLevel: "M",
  });
  const inner = qr.replace(/^[\s\S]*?<svg[^>]*viewBox="([^"]+)"[^>]*>/, "").replace("</svg>", "");
  const vb = /viewBox="([^"]+)"/.exec(qr)![1].split(" ").map(Number)[2];
  const size = 220;
  const paid = reg.status === "SUCCESSFUL";
  const serif = "Georgia, 'Times New Roman', serif";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 860" width="600" height="860">
<rect width="600" height="860" fill="#3b2314"/>
<rect x="20" y="20" width="560" height="820" rx="18" fill="#f6ecdc"/>
<rect x="34" y="34" width="532" height="792" rx="12" fill="none" stroke="#a9743f" stroke-width="2"/>
<text x="300" y="110" text-anchor="middle" font-family="${serif}" font-size="15" letter-spacing="6" fill="#a9743f">YOU ARE INVITED TO</text>
<text x="300" y="190" text-anchor="middle" font-family="${serif}" font-size="58" font-style="italic" fill="#3b2314">${esc(EVENT_NAME)}</text>
<line x1="220" y1="225" x2="380" y2="225" stroke="#a9743f" stroke-width="2"/>
<text x="300" y="290" text-anchor="middle" font-family="${serif}" font-size="14" letter-spacing="4" fill="#7a5638">GUEST</text>
<text x="300" y="335" text-anchor="middle" font-family="${serif}" font-size="${reg.fullName.length > 22 ? 28 : 36}" fill="#3b2314">${esc(reg.fullName)}</text>
<text x="300" y="372" text-anchor="middle" font-family="${serif}" font-size="18" fill="#7a5638">${esc(reg.email)}</text>
<text x="300" y="400" text-anchor="middle" font-family="${serif}" font-size="18" fill="#7a5638">${esc(reg.phone)}</text>
<g transform="translate(${300 - size / 2} 440) scale(${size / vb})">${inner}</g>
<text x="300" y="705" text-anchor="middle" font-family="${serif}" font-size="14" letter-spacing="4" fill="#7a5638">INVITATION ID</text>
<text x="300" y="745" text-anchor="middle" font-family="'Courier New', monospace" font-size="34" font-weight="bold" fill="#3b2314">${esc(reg.id)}</text>
<text x="300" y="790" text-anchor="middle" font-family="${serif}" font-size="15" letter-spacing="3" fill="${paid ? "#4d6b2f" : "#9a3b1f"}">${paid ? `PAID · ${esc(formatFee(reg.amount))}` : "PAYMENT NOT CONFIRMED"}</text>
</svg>`;
}
