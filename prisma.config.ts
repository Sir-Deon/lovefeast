import { defineConfig } from "prisma/config";

// The Prisma CLI doesn't load Next's env files, so do it here (ignored if absent, e.g. on Netlify).
for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(f);
  } catch {}
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  // CLI (db push / migrate) should use Neon's direct (non-pooled) connection when available.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || "" },
});
