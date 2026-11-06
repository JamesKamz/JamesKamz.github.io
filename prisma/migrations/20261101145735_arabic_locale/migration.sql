-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "descAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "roleAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "FaqEntry" ADD COLUMN     "answerAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "problemAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "resultAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "solutionAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "summaryAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "descAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titleAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "aboutAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "availabilityAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "chatbotInstructionsAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "locationAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "taglineAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "titlesAr" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "SkillGroup" ADD COLUMN     "nameAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Stat" ADD COLUMN     "labelAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "textAr" TEXT;
