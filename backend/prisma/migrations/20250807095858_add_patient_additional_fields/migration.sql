-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "emergency_contact" JSONB,
ADD COLUMN     "gender" VARCHAR(20);

-- CreateIndex
CREATE INDEX "patients_date_of_birth_idx" ON "patients"("date_of_birth");
