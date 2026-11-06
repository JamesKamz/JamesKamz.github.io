-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "email" TEXT,
ADD COLUMN     "project" TEXT;

-- CreateTable
CREATE TABLE "TestimonialInvite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "project" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "testimonialId" TEXT,

    CONSTRAINT "TestimonialInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestimonialInvite_token_key" ON "TestimonialInvite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TestimonialInvite_testimonialId_key" ON "TestimonialInvite"("testimonialId");

-- AddForeignKey
ALTER TABLE "TestimonialInvite" ADD CONSTRAINT "TestimonialInvite_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "Testimonial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
