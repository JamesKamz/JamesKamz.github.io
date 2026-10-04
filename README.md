# James Kamz — Portfolio (Next.js)

Portfolio, estimateur de budget, chatbot IA et dashboard admin de **Koffi Jacques Amouzou — James Kamz**
(SaaS Builder · Full-Stack Engineer · Odoo Developer · Automation Expert).

- **Stack** : Next.js 16 (App Router, Turbopack) · TypeScript strict · Tailwind CSS 4 · Framer Motion ·
  Prisma 7 + PostgreSQL (Neon / Supabase) · Auth.js v5 · next-intl (FR par défaut / EN) · Zod ·
  React Hook Form · Resend · API Anthropic (Claude) · Vitest · Playwright
- **Déploiement cible** : Vercel (routes serveur, base de données et auth — pas d'export statique, GitHub Pages n'est plus utilisé).

## Fonctionnalités

| Public | Admin (`/admin`) |
| --- | --- |
| Hero (titres rotatifs, badges ComeUp/Upwork), chiffres clés animés, services en bento, études de cas filtrables + pages détail, témoignages, YouTube (API v3, cache 1 h), compétences | Connexion sécurisée (email + mot de passe bcrypt, GitHub OAuth optionnel), vue d'ensemble (leads, messages, conversations, graphique mensuel) |
| Estimateur de budget multi-étapes `/budget` (fourchette MAD / EUR / USD) → lead en base | CRUD bilingue : projets (upload d'images), témoignages (publier/masquer, ordre), services, compétences, expériences, chiffres clés, FAQ du chatbot |
| Contact (validation Zod, honeypot, rate limit, email Resend + base), WhatsApp optionnel | Leads & budgets : estimé, validé, payé, reste à payer, statut, notes, dates, totaux par statut |
| Chatbot IA en streaming sur toutes les pages, bilingue | Tarifs de l'estimateur, paramètres du site (identité, liens, CV, chatbot), messages, conversations IA |
| À propos (timeline, valeurs, CV, FAQ), mentions légales, confidentialité, 404 | Toute modification est visible immédiatement (revalidation, sans redéploiement) |

SEO : métadonnées FR/EN, Open Graph + Twitter, image OG dynamique, `sitemap.xml` avec hreflang, `robots.txt`,
JSON-LD `Person` + `ProfessionalService`. Sécurité : en-têtes (CSP, HSTS, X-Frame-Options…), validation Zod
côté serveur, vérification d'origine (CSRF) sur les API publiques, Server Actions protégées, mots de passe hashés,
IP jamais stockées en clair.

## Architecture

```
prisma/                 schema.prisma, migrations/, seed.ts (contenu de l'ancien site + compte admin)
src/
  app/[locale]/         pages publiques (FR sans préfixe, EN sous /en, URLs localisées)
  app/admin/            dashboard (login + groupe (dashboard) protégé)
  app/api/              contact, leads, chat, auth
  components/           sections, formulaires, chat, admin, ui
  content/defaults.ts   contenu par défaut (sert au seed ET de repli si la base est absente)
  lib/                  content (lecture DB + repli), pricing/budget, validation, rate-limit, mail, youtube…
  lib/admin/            ressources CRUD déclaratives, actions serveur, garde d'accès
  messages/             textes d'interface fr.json / en.json
  proxy.ts              i18n + protection /admin (ex-middleware)
tests/unit, tests/e2e   Vitest et Playwright
```

Le site public fonctionne même sans base de données (contenu par défaut) : pratique pour un premier aperçu ou la CI.

## Installation locale

Prérequis : Node.js ≥ 20.9 (22 recommandé), PostgreSQL 14+ (local, Docker, Neon ou Supabase).

```bash
npm install                      # génère aussi le client Prisma
cp .env.example .env             # puis remplissez les valeurs (voir ci-dessous)
npx prisma migrate dev           # crée les tables
npx prisma db seed               # importe le contenu + crée le compte admin
npm run dev                      # http://localhost:3000  — admin : http://localhost:3000/admin
```

Postgres rapide avec Docker :
`docker run -d --name jk-db -e POSTGRES_PASSWORD=jk -e POSTGRES_DB=jameskamz -p 5432:5432 postgres:16`
→ `DATABASE_URL=postgresql://postgres:jk@localhost:5432/jameskamz`

### Variables d'environnement

| Variable | Requis | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | oui | URL canonique (`https://jameskamz.com`) — SEO, sitemap, OG |
| `DATABASE_URL` | oui | Connexion PostgreSQL (Neon : URL *pooled*, `?sslmode=require`) |
| `AUTH_SECRET` | oui | Secret Auth.js (`npx auth secret` ou `openssl rand -base64 33`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | oui (seed) | Compte admin créé/mis à jour par le seed (mot de passe ≥ 12 caractères) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` / `ADMIN_GITHUB_LOGIN` | non | Connexion GitHub, limitée au login indiqué |
| `RESEND_API_KEY` | recommandé | Envoi des emails (contact, demandes de devis) |
| `CONTACT_TO_EMAIL` | recommandé | Destinataire des notifications (`jameskamzk@gmail.com`) |
| `CONTACT_FROM_EMAIL` | recommandé | Expéditeur vérifié sur Resend (ex. `Portfolio <noreply@jameskamz.com>`) |
| `ANTHROPIC_API_KEY` | pour le chatbot | Clé API Anthropic (sans clé, le widget affiche un message d'indisponibilité) |
| `ANTHROPIC_MODEL` | non | Modèle du chatbot (défaut `claude-opus-5-5`) |
| `YOUTUBE_API_KEY` | non | YouTube Data API v3 (sinon : carte de repli vers la chaîne) |
| `BLOB_READ_WRITE_TOKEN` | prod | Vercel Blob pour les uploads d'images/CV depuis l'admin |
| `AUTH_TRUST_HOST` | hors Vercel | `true` derrière un proxy autre que Vercel |

### Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` / `build` / `start` | Développement, build de production, serveur |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Tests unitaires (calcul du budget, validations, totaux des leads) |
| `npm run test:e2e` | Playwright (parcours contact + estimateur, desktop et mobile) — build puis lance le serveur |
| `npm run db:migrate` · `db:deploy` · `db:seed` · `db:studio` | Prisma |

`SEED_FORCE=true npx prisma db seed` réécrit le contenu par défaut (sinon le seed n'ajoute que ce qui manque et
préserve vos modifications). Le compte admin est toujours mis à jour avec `ADMIN_PASSWORD` (utile pour réinitialiser).

## Déploiement sur Vercel + Neon

1. **Base Neon** : créez un projet sur [neon.tech](https://neon.tech) (région proche, ex. `eu-central-1`) et copiez la
   connection string *pooled*.
2. **Projet Vercel** : *Add New → Project*, importez le dépôt GitHub. Framework : Next.js. La commande de build
   `vercel-build` (définie dans `package.json`) génère Prisma, applique les migrations (`prisma migrate deploy`) puis
   build — rien à configurer.
3. **Variables** : ajoutez toutes les variables ci-dessus (Production + Preview). Créez un store **Vercel Blob**
   (*Storage → Blob*) : `BLOB_READ_WRITE_TOKEN` est ajouté automatiquement.
4. **Déployez**, puis initialisez le contenu une fois, depuis votre machine :
   ```bash
   DATABASE_URL="<url neon>" ADMIN_EMAIL=... ADMIN_PASSWORD=... npx prisma db seed
   ```
5. **Resend** : ajoutez et vérifiez le domaine `jameskamz.com` (enregistrements DNS fournis par Resend) pour
   `CONTACT_FROM_EMAIL`.
6. Connectez-vous sur `https://jameskamz.com/admin`, puis complétez : ville dans *Paramètres* (localisation),
   chiffres clés (clients, note, abonnés), vrais témoignages, CV anglais, numéro WhatsApp.

### Connecter le domaine jameskamz.com

1. Vercel → *Project → Settings → Domains* → ajoutez `jameskamz.com` et `www.jameskamz.com` (redirigé vers l'apex).
2. Chez le registrar : `A @ 76.76.21.21` et `CNAME www cname.vercel-dns.com` (ou utilisez les nameservers Vercel).
3. Le certificat HTTPS est émis automatiquement. Mettez `NEXT_PUBLIC_SITE_URL=https://jameskamz.com`.
4. GitHub Pages n'est plus utilisé : désactivez-le dans *Settings → Pages* du dépôt pour éviter un doublon
   sur `jameskamz.github.io` (ou laissez-y une simple redirection).

## Contenu & conventions

- Les textes d'interface sont dans `src/messages/{fr,en}.json` ; le contenu éditorial (projets, services…) est en base,
  bilingue, éditable depuis l'admin.
- Les **témoignages** ne sont jamais inventés : le seed crée deux exemples marqués « EXEMPLE — à remplacer », non publiés.
- Les anciens assets sont conservés dans `public/legacy/img/` ; les versions optimisées (WebP) utilisées par le site sont
  dans `public/images/`, le CV dans `public/cv/`.
- Tarifs de l'estimateur : *Admin → Tarifs* (prix de base par type, coût par fonctionnalité, multiplicateurs délai/design,
  taux de change, largeur de fourchette). Calcul : `(base + Σ fonctionnalités) × délai × design ± fourchette`.
