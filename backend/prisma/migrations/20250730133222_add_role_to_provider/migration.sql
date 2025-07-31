/*
  Warnings:

  - Added the required column `roleId` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the column with a default value
ALTER TABLE "Provider" ADD COLUMN "roleId" INTEGER;

-- Update existing providers to have a default role (Physician - role ID 5)
UPDATE "Provider" SET "roleId" = 5 WHERE "roleId" IS NULL;

-- Make the column NOT NULL
ALTER TABLE "Provider" ALTER COLUMN "roleId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Provider_roleId_idx" ON "Provider"("roleId");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
