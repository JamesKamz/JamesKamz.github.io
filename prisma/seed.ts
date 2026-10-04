/**
 * Seed: imports the legacy site content + 2026 positioning, and creates the admin account.
 *
 *   npx prisma db seed            → inserts missing rows only (safe to re-run, keeps admin edits)
 *   SEED_FORCE=true npx prisma db seed → overwrites content rows with the defaults
 *
 * The admin account is created/updated from ADMIN_EMAIL + ADMIN_PASSWORD.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  defaultExperiences,
  defaultFaq,
  defaultProjects,
  defaultServices,
  defaultSettings,
  defaultSkillGroups,
  defaultStats,
  defaultTestimonials,
} from "../src/content/defaults";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required to seed");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const force = process.env.SEED_FORCE === "true";

async function main() {
  // --- Settings (singleton)
  const { id: _sid, ...settings } = defaultSettings;
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: { id: "main", ...settings },
    update: force ? settings : {},
  });

  // --- Stats
  for (const { id: _id, ...stat } of defaultStats) {
    await prisma.stat.upsert({ where: { key: stat.key }, create: stat, update: force ? stat : {} });
  }

  // --- Services
  for (const { id: _id, ...service } of defaultServices) {
    await prisma.service.upsert({ where: { slug: service.slug }, create: service, update: force ? service : {} });
  }

  // --- Projects
  for (const { id: _id, ...project } of defaultProjects) {
    await prisma.project.upsert({ where: { slug: project.slug }, create: project, update: force ? project : {} });
  }

  // --- Skills
  for (const { id: _id, ...group } of defaultSkillGroups) {
    await prisma.skillGroup.upsert({ where: { slug: group.slug }, create: group, update: force ? group : {} });
  }

  // --- Experiences / FAQ / Testimonials: insert only when the table is empty
  if (force || (await prisma.experience.count()) === 0) {
    await prisma.experience.deleteMany();
    await prisma.experience.createMany({ data: defaultExperiences.map(({ id: _id, ...e }) => e) });
  }
  if (force || (await prisma.faqEntry.count()) === 0) {
    await prisma.faqEntry.deleteMany();
    await prisma.faqEntry.createMany({ data: defaultFaq.map(({ id: _id, ...f }) => f) });
  }
  if ((await prisma.testimonial.count()) === 0) {
    // Clearly-marked examples, NOT published.
    await prisma.testimonial.createMany({ data: defaultTestimonials.map(({ id: _id, ...t }) => t) });
  }

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
