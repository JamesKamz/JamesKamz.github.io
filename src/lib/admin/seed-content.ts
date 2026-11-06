/**
 * Writes the bundled site content (src/content/defaults.ts) to the database.
 * Shared by `prisma/seed.ts` and the "Importer le contenu" button in the admin settings,
 * so a fresh production database is filled from the repository files, never from a local dump.
 *
 * - default: inserts missing rows only (keeps every edit made in the admin);
 * - force: overwrites content rows with the defaults.
 * Leads, messages, conversations, testimonials received from clients and visit stats are never touched.
 */
import {
  defaultExperiences,
  defaultFaq,
  defaultProjects,
  defaultServices,
  defaultSettings,
  defaultSkillGroups,
  defaultStats,
  defaultTestimonials,
} from "@/content/defaults";
import type { PrismaClient } from "@/generated/prisma/client";

export type SeedReport = { force: boolean; settings: boolean; stats: number; services: number; projects: number; skills: number; experiences: number; faq: number };

export async function seedContent(prisma: PrismaClient, { force = false }: { force?: boolean } = {}): Promise<SeedReport> {
  // Only rows that did not exist yet count as created (unless forced).
  const created = async <T>(exists: Promise<T | null>, write: () => Promise<unknown>) => {
    const had = Boolean(await exists);
    await write();
    return force || !had ? 1 : 0;
  };

  const { id: _sid, ...settings } = defaultSettings;
  const settingsWritten = await created(prisma.siteSettings.findUnique({ where: { id: "main" } }), () =>
    prisma.siteSettings.upsert({ where: { id: "main" }, create: { id: "main", ...settings }, update: force ? settings : {} }),
  );

  let stats = 0;
  for (const { id: _id, ...stat } of defaultStats) {
    stats += await created(prisma.stat.findUnique({ where: { key: stat.key } }), () =>
      prisma.stat.upsert({ where: { key: stat.key }, create: stat, update: force ? stat : {} }),
    );
  }

  let services = 0;
  for (const { id: _id, ...service } of defaultServices) {
    services += await created(prisma.service.findUnique({ where: { slug: service.slug } }), () =>
      prisma.service.upsert({ where: { slug: service.slug }, create: service, update: force ? service : {} }),
    );
  }

  let projects = 0;
  for (const { id: _id, ...project } of defaultProjects) {
    projects += await created(prisma.project.findUnique({ where: { slug: project.slug } }), () =>
      prisma.project.upsert({ where: { slug: project.slug }, create: project, update: force ? project : {} }),
    );
  }

  let skills = 0;
  for (const { id: _id, ...group } of defaultSkillGroups) {
    skills += await created(prisma.skillGroup.findUnique({ where: { slug: group.slug } }), () =>
      prisma.skillGroup.upsert({ where: { slug: group.slug }, create: group, update: force ? group : {} }),
    );
  }

  // Experiences / FAQ have no natural key: replaced as a whole, only when forced or empty.
  let experiences = 0;
  if (force || (await prisma.experience.count()) === 0) {
    await prisma.$transaction([prisma.experience.deleteMany(), prisma.experience.createMany({ data: defaultExperiences.map(({ id: _id, ...e }) => e) })]);
    experiences = defaultExperiences.length;
  }
  let faq = 0;
  if (force || (await prisma.faqEntry.count()) === 0) {
    await prisma.$transaction([prisma.faqEntry.deleteMany(), prisma.faqEntry.createMany({ data: defaultFaq.map(({ id: _id, ...f }) => f) })]);
    faq = defaultFaq.length;
  }
  // Clearly-marked examples, NOT published; real client testimonials are never replaced.
  if ((await prisma.testimonial.count()) === 0) {
    await prisma.testimonial.createMany({ data: defaultTestimonials.map(({ id: _id, ...t }) => t) });
  }

  return { force, settings: settingsWritten === 1, stats, services, projects, skills, experiences, faq };
}
