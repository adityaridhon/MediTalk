/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `report` to the `Consultation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('ACTIVE', 'COMPLETE');

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "status" "ConsultationStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "report",
ADD COLUMN     "report" JSONB NOT NULL;

-- DropTable
DROP TABLE "public"."Session";

-- DropTable
DROP TABLE "public"."VerificationToken";
