-- CreateTable
CREATE TABLE "appointments" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "date" TIMESTAMP(3),
    "type" INTEGER,
    "slot_id" INTEGER,
    "location_id" INTEGER,
    "time" TEXT,
    "chief_complaint" TEXT,
    "status" TEXT DEFAULT 'Scheduled',
    "patient_id" INTEGER,
    "patient_conflict_id" INTEGER,
    "provider_id" INTEGER,
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_uuid_key" ON "appointments"("uuid");

-- CreateIndex
CREATE INDEX "appointments_id_idx" ON "appointments"("id");

-- CreateIndex
CREATE INDEX "appointments_location_id_idx" ON "appointments"("location_id");

-- CreateIndex
CREATE INDEX "appointments_provider_id_idx" ON "appointments"("provider_id");

-- CreateIndex
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
