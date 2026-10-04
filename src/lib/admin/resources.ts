import { iconNames } from "@/components/icons/Icon";

/**
 * Declarative admin resources: one config drives the list page, the form,
 * FormData parsing and validation (see actions.ts).
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "tags"
  | "image"
  | "images"
  | "pdf"
  | "date"
  | "url"
  | "email";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  /** Spans the full form width (default for textarea/images). */
  wide?: boolean;
  rows?: number;
  nullable?: boolean;
  step?: string;
};

export type Resource = {
  key: string;
  model: "project" | "testimonial" | "service" | "skillGroup" | "experience" | "stat" | "faqEntry";
  title: string;
  singular: string;
  description?: string;
  fields: Field[];
  /** Columns shown in the list (field names). First one is the main label. */
  columns: string[];
  /** Boolean fields that can be toggled from the list. */
  toggles?: string[];
  orderBy: Record<string, "asc" | "desc">[];
  /** Unique slug field auto-generated from another field. */
  slugFrom?: string;
};

const icons = iconNames.map((n) => ({ value: n, label: n }));
const bilingual = (name: string, label: string, type: FieldType = "text", extra: Partial<Field> = {}): Field[] => [
  { name: `${name}Fr`, label: `${label} (FR)`, type, required: true, ...extra },
  { name: `${name}En`, label: `${label} (EN)`, type, required: true, ...extra },
];
const order: Field = { name: "order", label: "Ordre d'affichage", type: "number", help: "Plus petit = affiché en premier" };

export const resources: Resource[] = [
  {
    key: "projects",
    model: "project",
    title: "Projets",
    singular: "projet",
    description: "Études de cas affichées sur le site (bilingue).",
    slugFrom: "titleFr",
    columns: ["titleFr", "categories", "year", "order"],
    toggles: ["published", "featured"],
    orderBy: [{ order: "asc" }],
    fields: [
      ...bilingual("title", "Titre"),
      { name: "slug", label: "Slug (URL)", type: "text", help: "Généré depuis le titre FR si vide" },
      { name: "year", label: "Année", type: "number", nullable: true },
      ...bilingual("summary", "Résumé", "textarea", { rows: 2 }),
      ...bilingual("problem", "Problème", "textarea", { rows: 3 }),
      ...bilingual("solution", "Solution", "textarea", { rows: 3 }),
      ...bilingual("result", "Résultat", "textarea", { rows: 3 }),
      {
        name: "categories",
        label: "Catégories",
        type: "multiselect",
        required: true,
        options: [
          { value: "SAAS", label: "SaaS" },
          { value: "WEB", label: "Web" },
          { value: "API", label: "API" },
          { value: "ODOO", label: "Odoo" },
          { value: "AUTOMATION", label: "Automatisation" },
        ],
      },
      { name: "stack", label: "Stack", type: "tags", help: "Séparées par des virgules" },
      { name: "liveUrl", label: "URL du site", type: "url", nullable: true },
      { name: "repoUrl", label: "URL du code source", type: "url", nullable: true },
      { name: "coverImage", label: "Image de couverture", type: "image", nullable: true },
      { name: "gallery", label: "Galerie", type: "images", wide: true },
      order,
      { name: "featured", label: "Mis en avant", type: "boolean" },
      { name: "published", label: "Publié", type: "boolean" },
    ],
  },
  {
    key: "testimonials",
    model: "testimonial",
    title: "Témoignages",
    singular: "témoignage",
    description: "N'affichez que de vrais avis. Les exemples sont marqués et non publiés.",
    columns: ["authorName", "platform", "rating", "order"],
    toggles: ["published"],
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    fields: [
      { name: "authorName", label: "Nom", type: "text", required: true },
      { name: "authorRole", label: "Rôle / entreprise", type: "text", nullable: true },
      { name: "country", label: "Pays", type: "text", nullable: true },
      {
        name: "platform",
        label: "Plateforme",
        type: "select",
        required: true,
        options: [
          { value: "COMEUP", label: "ComeUp" },
          { value: "UPWORK", label: "Upwork" },
          { value: "DIRECT", label: "Client direct" },
        ],
      },
      { name: "rating", label: "Note (1–5)", type: "number", required: true },
      { name: "sourceUrl", label: "Lien vers l'avis source", type: "url", nullable: true },
      { name: "textFr", label: "Texte (FR)", type: "textarea", required: true, rows: 4 },
      { name: "textEn", label: "Texte (EN)", type: "textarea", nullable: true, rows: 4 },
      order,
      { name: "isExample", label: "Exemple (à remplacer)", type: "boolean" },
      { name: "published", label: "Publié", type: "boolean" },
    ],
  },
  {
    key: "services",
    model: "service",
    title: "Services",
    singular: "service",
    slugFrom: "titleFr",
    columns: ["titleFr", "size", "order"],
    toggles: ["published"],
    orderBy: [{ order: "asc" }],
    fields: [
      ...bilingual("title", "Titre"),
      { name: "slug", label: "Slug", type: "text" },
      { name: "icon", label: "Icône", type: "select", options: icons, required: true },
      ...bilingual("desc", "Description", "textarea", { rows: 3 }),
      { name: "tags", label: "Tags", type: "tags" },
      {
        name: "size",
        label: "Taille (bento)",
        type: "select",
        options: [
          { value: "lg", label: "Grande (4/6)" },
          { value: "md", label: "Moyenne (2/6)" },
          { value: "sm", label: "Demi (3/6)" },
        ],
      },
      order,
      { name: "published", label: "Publié", type: "boolean" },
    ],
  },
  {
    key: "skills",
    model: "skillGroup",
    title: "Compétences",
    singular: "groupe de compétences",
    slugFrom: "nameEn",
    columns: ["nameFr", "items", "order"],
    orderBy: [{ order: "asc" }],
    fields: [
      ...bilingual("name", "Nom du domaine"),
      { name: "slug", label: "Slug", type: "text" },
      { name: "icon", label: "Icône", type: "select", options: icons, required: true },
      { name: "items", label: "Compétences", type: "tags", wide: true, help: "Séparées par des virgules" },
      order,
    ],
  },
  {
    key: "experiences",
    model: "experience",
    title: "Expériences",
    singular: "expérience",
    columns: ["roleFr", "company", "startDate", "order"],
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
    fields: [
      {
        name: "kind",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "WORK", label: "Expérience" },
          { value: "EDUCATION", label: "Formation" },
          { value: "AWARD", label: "Distinction" },
        ],
      },
      { name: "company", label: "Organisation", type: "text", required: true },
      ...bilingual("role", "Intitulé"),
      { name: "startDate", label: "Début", type: "date", required: true },
      { name: "endDate", label: "Fin (vide = en cours)", type: "date", nullable: true },
      ...bilingual("desc", "Description", "textarea", { rows: 3 }),
      order,
    ],
  },
  {
    key: "stats",
    model: "stat",
    title: "Chiffres clés",
    singular: "chiffre",
    description: "Le chiffre « youtubeSubscribers » est remplacé automatiquement par la valeur live si la clé YouTube est configurée.",
    columns: ["labelFr", "value", "suffix", "order"],
    toggles: ["visible"],
    orderBy: [{ order: "asc" }],
    fields: [
      { name: "key", label: "Clé technique", type: "text", required: true, help: "years, projects, clients, rating, youtubeSubscribers…" },
      ...bilingual("label", "Libellé"),
      { name: "value", label: "Valeur", type: "number", required: true, step: "any" },
      { name: "decimals", label: "Décimales", type: "number" },
      { name: "prefix", label: "Préfixe", type: "text" },
      { name: "suffix", label: "Suffixe", type: "text", help: "ex. + ou /5" },
      order,
      { name: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    key: "faq",
    model: "faqEntry",
    title: "FAQ du chatbot",
    singular: "question",
    description: "Utilisée par le chatbot et affichée sur la page À propos.",
    columns: ["questionFr", "order"],
    toggles: ["published"],
    orderBy: [{ order: "asc" }],
    fields: [
      ...bilingual("question", "Question"),
      ...bilingual("answer", "Réponse", "textarea", { rows: 4 }),
      order,
      { name: "published", label: "Publiée", type: "boolean" },
    ],
  },
];

export function getResource(key: string): Resource | undefined {
  return resources.find((r) => r.key === key);
}

/** Fields of the singleton SiteSettings form. */
export const settingsFields: Field[] = [
  { name: "fullName", label: "Nom complet", type: "text", required: true },
  { name: "alias", label: "Alias", type: "text", required: true },
  { name: "titlesFr", label: "Titres rotatifs (FR)", type: "tags", required: true, help: "Séparés par des virgules" },
  { name: "titlesEn", label: "Titres rotatifs (EN)", type: "tags", required: true },
  { name: "taglineFr", label: "Accroche (FR)", type: "textarea", required: true, rows: 3 },
  { name: "taglineEn", label: "Accroche (EN)", type: "textarea", required: true, rows: 3 },
  { name: "aboutFr", label: "À propos (FR)", type: "textarea", required: true, rows: 8, help: "Paragraphes séparés par une ligne vide" },
  { name: "aboutEn", label: "À propos (EN)", type: "textarea", required: true, rows: 8 },
  { name: "locationFr", label: "Localisation (FR)", type: "text", required: true, help: "ex. Casablanca, Maroc" },
  { name: "locationEn", label: "Localisation (EN)", type: "text", required: true },
  { name: "availabilityFr", label: "Disponibilité (FR)", type: "text", required: true },
  { name: "availabilityEn", label: "Disponibilité (EN)", type: "text", required: true },
  { name: "available", label: "Disponible en freelance", type: "boolean" },
  { name: "email", label: "Email de contact", type: "email", required: true },
  { name: "phone", label: "Téléphone", type: "text", nullable: true },
  { name: "whatsapp", label: "WhatsApp (numéro international)", type: "text", nullable: true, help: "ex. +212 6 00 00 00 00 — vide = masqué" },
  { name: "linkedin", label: "LinkedIn", type: "url", nullable: true },
  { name: "github", label: "GitHub", type: "url", nullable: true },
  { name: "youtube", label: "YouTube", type: "url", nullable: true },
  { name: "youtubeHandle", label: "Handle YouTube (sans @)", type: "text", nullable: true },
  { name: "facebook", label: "Facebook", type: "url", nullable: true },
  { name: "instagram", label: "Instagram", type: "url", nullable: true },
  { name: "comeup", label: "ComeUp", type: "url", nullable: true },
  { name: "upwork", label: "Upwork", type: "url", nullable: true },
  { name: "comeupSince", label: "Vendeur ComeUp depuis (année)", type: "number", nullable: true },
  { name: "photoUrl", label: "Photo de profil", type: "image", nullable: true },
  { name: "cvFrUrl", label: "CV (FR, PDF)", type: "pdf", nullable: true },
  { name: "cvEnUrl", label: "CV (EN, PDF)", type: "pdf", nullable: true },
  { name: "chatbotEnabled", label: "Chatbot activé", type: "boolean" },
  { name: "chatbotInstructionsFr", label: "Instructions du chatbot (FR)", type: "textarea", required: true, rows: 8, wide: true },
  { name: "chatbotInstructionsEn", label: "Instructions du chatbot (EN)", type: "textarea", required: true, rows: 8, wide: true },
];
