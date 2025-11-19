/*
  Warnings:

  - You are about to drop the `consultations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."consultations" DROP CONSTRAINT "consultations_createdBy_fkey";

-- DropTable
DROP TABLE "public"."consultations";

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "gejala" TEXT NOT NULL,
    "conversation" JSONB NOT NULL,
    "report" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
