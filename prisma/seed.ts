/**
 * Seed: writes the bundled site content (src/content/defaults.ts) and creates the admin account.
 * The content part can also be run from the admin: Paramètres du site → Contenu du site.
 *
 *   npx prisma db seed            → inserts missing rows only (safe to re-run, keeps admin edits)
 *   SEED_FORCE=true npx prisma db seed → overwrites content rows with the defaults
 *
 * The admin account is created/updated from ADMIN_EMAIL + ADMIN_PASSWORD.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { defaultSettings } from "../src/content/defaults";
import { seedContent } from "../src/lib/admin/seed-content";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required to seed");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const force = process.env.SEED_FORCE === "true";

async function main() {
  // --- Site content (same code as the "Importer le contenu" button in the admin)
  const report = await seedContent(prisma, { force });
  console.log("✔ content:", report);

  // --- Admin account
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      create: { email, name: defaultSettings.alias, passwordHash, githubLogin: process.env.ADMIN_GITHUB_LOGIN || null },
      update: { passwordHash, githubLogin: process.env.ADMIN_GITHUB_LOGIN || undefined },
    });
    console.log(`✔ admin account ready: ${email}`);
  } else {
    console.warn("⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set — admin account not created");
  }

  console.log(`✔ seed complete${force ? " (forced)" : ""}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
