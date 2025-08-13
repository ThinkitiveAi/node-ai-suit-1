/*
  Warnings:

  - You are about to drop the column `address` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "patients" DROP COLUMN "address",
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(50) DEFAULT 'USA',
ADD COLUMN     "state" VARCHAR(50),
ADD COLUMN     "street_address" VARCHAR(200),
ADD COLUMN     "zip_code" VARCHAR(10);

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "country" VARCHAR(50) DEFAULT 'USA',
ADD COLUMN     "street_address" VARCHAR(200),
ADD COLUMN     "zip_code" VARCHAR(10);

-- CreateIndex
CREATE INDEX "patients_city_idx" ON "patients"("city");

-- CreateIndex
CREATE INDEX "patients_state_idx" ON "patients"("state");

-- CreateIndex
CREATE INDEX "providers_state_idx" ON "providers"("state");
