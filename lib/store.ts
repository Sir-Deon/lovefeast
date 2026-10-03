import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { onlineAmount, REGISTRATION_FEE } from "./config";
import { PrismaClient, type Registration as Row } from "@/generated/prisma/client";

export type PaymentStatus = "CREATED" | "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";

export type Registration = Omit<Row, "status" | "paymentMethod"> & {
  status: PaymentStatus;
  paymentMethod: "ONLINE" | "CASH";
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Use Neon's pooled connection string here. Keep the pool tiny: every serverless
    // instance opens its own, and Neon's pooler does the real multiplexing.
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 }),
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const typed = (r: Row | null) => (r ? (r as Registration) : undefined);

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newId(): string {
  return "LR-" + Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function listRegistrations(): Promise<Registration[]> {
  return (await prisma.registration.findMany({ orderBy: { createdAt: "desc" } })) as Registration[];
}

export async function getRegistration(id: string) {
  return typed(await prisma.registration.findUnique({ where: { id } }));
}

export async function getByTransId(transId: string) {
  return typed(await prisma.registration.findUnique({ where: { transId } }));
}

export async function createRegistration(
  input: Pick<Registration, "fullName" | "email" | "phone" | "whatsapp" | "createdByAdmin" | "paymentMethod"> &
    Partial<Pick<Registration, "status">>,
): Promise<Registration> {
  for (let attempt = 0; ; attempt++) {
    try {
      const row = await prisma.registration.create({
        data: { id: newId(), amount: input.paymentMethod === "ONLINE" ? onlineAmount() : REGISTRATION_FEE, ...input, paidAt: input.status === "SUCCESSFUL" ? new Date() : null },
      });
      return row as Registration;
    } catch (e) {
      // Retry on the (very unlikely) id collision.
      if ((e as { code?: string }).code !== "P2002" || attempt >= 4) throw e;
    }
  }
}

export async function updateRegistration(
  id: string,
  patch: Partial<Omit<Registration, "id">>,
): Promise<Registration | undefined> {
  try {
    return (await prisma.registration.update({ where: { id }, data: patch })) as Registration;
  } catch (e) {
    if ((e as { code?: string }).code === "P2025") return undefined;
    throw e;
  }
}

export async function deleteRegistration(id: string) {
  await prisma.registration.deleteMany({ where: { id } });
}

/** Atomically admit a paid, not-yet-admitted guest. Returns false if that wasn't possible. */
export async function admitRegistration(id: string): Promise<boolean> {
  const { count } = await prisma.registration.updateMany({
    where: { id, status: "SUCCESSFUL", admittedAt: null },
    data: { admittedAt: new Date() },
  });
  return count === 1;
}
