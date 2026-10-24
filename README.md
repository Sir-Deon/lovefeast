# Love Feast — event registration

Next.js + Prisma (SQLite / Turso) + Fapshi payments. See `.env.example` for all settings.

## Local development

```
cp .env.example .env.local   # fill in values, incl. a Neon DATABASE_URL / DIRECT_URL
npm install
npm run db:push              # creates the tables in Neon
npm run dev
```

Tip: create a separate Neon *branch* for local development so test data stays out of production.

Admin: `/admin` (open the private link `APP_URL/admin/access/<ADMIN_ACCESS_TOKEN>`; generate a token with `openssl rand -hex 24`). Check-in: `/admin/checkin`.

## Deploy to Netlify

1. Create a Neon project. From its dashboard copy two connection strings: the **pooled** one
   (`DATABASE_URL`) and the **direct** one (`DIRECT_URL`).
2. Create the tables once: `npm run db:push` with `DIRECT_URL` set to the production database.
3. Push the repo to GitHub and import it in Netlify (build settings come from `netlify.toml`).
4. Set these environment variables in Netlify (Site configuration → Environment variables):
   `APP_URL` (your Netlify URL, no trailing slash), `REGISTRATION_FEE`, `FAPSHI_BASE_URL`,
   `FAPSHI_API_KEY`, `FAPSHI_API_USER`, `ADMIN_ACCESS_TOKEN`, `ADMIN_SESSION_SECRET`, `DATABASE_URL`.
5. In the Fapshi dashboard set the webhook to `APP_URL/api/webhook/fapshi`.

Changing an environment variable on Netlify requires a redeploy.
