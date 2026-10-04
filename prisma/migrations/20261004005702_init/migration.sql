-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('SAAS', 'WEB', 'API', 'ODOO', 'AUTOMATION');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('COMEUP', 'UPWORK', 'DIRECT');

-- CreateEnum
CREATE TYPE "ExperienceKind" AS ENUM ('WORK', 'EDUCATION', 'AWARD');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'DISCUSSION', 'QUOTE_SENT', 'IN_PROGRESS', 'DELIVERED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('BUDGET', 'CONTACT', 'CHAT', 'MANUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "githubLogin" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "fullName" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "titlesFr" TEXT[],
    "titlesEn" TEXT[],
    "taglineFr" TEXT NOT NULL,
    "taglineEn" TEXT NOT NULL,
    "aboutFr" TEXT NOT NULL,
    "aboutEn" TEXT NOT NULL,
    "locationFr" TEXT NOT NULL,
    "locationEn" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "availabilityFr" TEXT NOT NULL,
    "availabilityEn" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "youtube" TEXT,
    "youtubeHandle" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "comeup" TEXT,
    "upwork" TEXT,
    "comeupSince" INTEGER,
    "photoUrl" TEXT,
    "cvFrUrl" TEXT,
    "cvEnUrl" TEXT,
    "chatbotEnabled" BOOLEAN NOT NULL DEFAULT true,
    "chatbotInstructionsFr" TEXT NOT NULL,
    "chatbotInstructionsEn" TEXT NOT NULL,
    "pricing" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '',
    "suffix" TEXT NOT NULL DEFAULT '',
    "decimals" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descFr" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "tags" TEXT[],
    "size" TEXT NOT NULL DEFAULT 'md',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "summaryFr" TEXT NOT NULL,
    "summaryEn" TEXT NOT NULL,
    "problemFr" TEXT NOT NULL,
    "problemEn" TEXT NOT NULL,
    "solutionFr" TEXT NOT NULL,
    "solutionEn" TEXT NOT NULL,
    "resultFr" TEXT NOT NULL,
    "resultEn" TEXT NOT NULL,
    "categories" "ProjectCategory"[],
    "stack" TEXT[],
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "coverImage" TEXT,
    "gallery" TEXT[],
    "year" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "country" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'DIRECT',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "textFr" TEXT NOT NULL,
    "textEn" TEXT,
    "sourceUrl" TEXT,
    "isExample" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGroup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "items" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "kind" "ExperienceKind" NOT NULL DEFAULT 'WORK',
    "roleFr" TEXT NOT NULL,
    "roleEn" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "descFr" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqEntry" (
    "id" TEXT NOT NULL,
    "questionFr" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "answerFr" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FaqEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "title" TEXT,
    "message" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'BUDGET',
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "projectType" TEXT,
    "features" TEXT[],
    "timeline" TEXT,
    "design" TEXT,
    "estimateMin" INTEGER,
    "estimateMax" INTEGER,
    "budgetValidated" INTEGER,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "budget" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubLogin_key" ON "User"("githubLogin");

-- CreateIndex
CREATE UNIQUE INDEX "Stat_key_key" ON "Stat"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SkillGroup_slug_key" ON "SkillGroup"("slug");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_handled_idx" ON "ContactMessage"("handled");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
