/*
  Warnings:

  - You are about to drop the column `company` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `ticketNumber` on the `Attendee` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Attendee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicID]` on the table `Attendee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicID` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attendee_ticketNumber_key";

-- AlterTable
ALTER TABLE "Attendee" DROP COLUMN "company",
DROP COLUMN "department",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "ticketNumber",
DROP COLUMN "title",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "publicID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_publicID_key" ON "Attendee"("publicID");
