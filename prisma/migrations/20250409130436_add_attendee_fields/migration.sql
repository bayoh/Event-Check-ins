-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "category" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "title" TEXT;
