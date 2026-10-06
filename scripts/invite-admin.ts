// Crée une invitation administrateur et affiche le lien (utile pour le tout premier compte).
// Usage : npx tsx --env-file=.env.local scripts/invite-admin.ts email@exemple.com [https://url-du-site]
import { createHash, randomBytes } from "node:crypto";
import postgres from "postgres";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  const base = process.argv[3] ?? process.env.APP_URL ?? "http://localhost:3000";
  if (!email || !email.includes("@")) throw new Error("Usage : invite-admin.ts <email> [url-du-site]");

  const pg = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, { max: 1 });
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  await pg`insert into invitations (email, token_hash, expires_at) values (${email}, ${hash}, now() + interval '7 days')`;
  await pg.end();
  console.log(`Invitation créée pour ${email} (valable 7 jours) :\n${base.replace(/\/$/, "")}/invitation/${token}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
