-- Seed data for Clinic Staff Manager
-- This file contains sample data for testing and development

-- Clear existing data (if any)
TRUNCATE TABLE "Availability" CASCADE;
TRUNCATE TABLE "Patient" CASCADE;
TRUNCATE TABLE "Provider" CASCADE;
TRUNCATE TABLE "Location" CASCADE;
TRUNCATE TABLE "Role" CASCADE;

-- Insert Roles
INSERT INTO "Role" (id, name, type) VALUES
(1, 'Practice Owner', 'STAFF'),
(2, 'Director', 'STAFF'),
(3, 'Front Office Admin', 'STAFF'),
(4, 'Records Custodian', 'STAFF'),
(5, 'Physician', 'CLINICIAN'),
(6, 'Nurse Practitioner', 'CLINICIAN'),
(7, 'Physician Assistant', 'CLINICIAN');

-- Insert Locations
INSERT INTO "Location" (id, name, address, city, state, zipCode, phone, isActive) VALUES
(1, 'Main Clinic', '123 Main Street', 'Los Angeles', 'CA', '90210', '(555) 123-4567', true),
(2, 'Downtown Office', '456 Downtown Blvd', 'New York', 'NY', '10001', '(555) 234-5678', true),
(3, 'Westside Branch', '789 Westside Ave', 'Miami', 'FL', '33101', '(555) 345-6789', true),
(4, 'North Campus', '321 North Road', 'Austin', 'TX', '73301', '(555) 456-7890', true);

-- Insert Providers
INSERT INTO "Provider" (id, email, name, password, phone, specialty, city, state) VALUES
(1, 'dr.cardiologist@clinic.com', 'Dr. Alice Cardiologist', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 111-1111', 'Cardiology', 'Los Angeles', 'CA'),
(2, 'dr.dermatologist@clinic.com', 'Dr. Bob Dermatologist', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 222-2222', 'Dermatology', 'New York', 'NY'),
(3, 'dr.orthopedist@clinic.com', 'Dr. Carol Orthopedist', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 333-3333', 'Orthopedics', 'Miami', 'FL'),
(4, 'dr.pediatrician@clinic.com', 'Dr. David Pediatrician', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 444-4444', 'Pediatrics', 'Austin', 'TX');

-- Insert Patients
INSERT INTO "Patient" (id, email, name, password, phone, address, assignedProviderId) VALUES
(1, 'john.doe@email.com', 'John Doe', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 555-5555', '123 Patient St, Los Angeles, CA 90210', 1),
(2, 'jane.smith@email.com', 'Jane Smith', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 666-6666', '456 Patient Ave, New York, NY 10001', 2),
(3, 'mike.johnson@email.com', 'Mike Johnson', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 777-7777', '789 Patient Blvd, Miami, FL 33101', 3),
(4, 'sarah.wilson@email.com', 'Sarah Wilson', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 888-8888', '321 Patient Rd, Austin, TX 73301', 4),
(5, 'robert.brown@email.com', 'Robert Brown', '$2a$10$rQZ8K9LmN2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N', '(555) 999-9999', '654 Patient Way, Los Angeles, CA 90210', 1);

-- Insert Availability
INSERT INTO "Availability" (id, providerId, locationId, availabilityType, dayOfWeek, startTime, endTime, repeatType, isActive) VALUES
(1, 1, 1, 'OFFLINE', 'MONDAY', '09:00', '17:00', 'NONE', true),
(2, 1, 1, 'OFFLINE', 'TUESDAY', '09:00', '17:00', 'NONE', true),
(3, 1, 1, 'OFFLINE', 'WEDNESDAY', '09:00', '17:00', 'NONE', true),
(4, 1, 1, 'VIRTUAL', 'THURSDAY', '10:00', '16:00', 'NONE', true),
(5, 1, 1, 'OFFLINE', 'FRIDAY', '09:00', '17:00', 'NONE', true),
(6, 2, 2, 'OFFLINE', 'MONDAY', '08:00', '16:00', 'NONE', true),
(7, 2, 2, 'OFFLINE', 'TUESDAY', '08:00', '16:00', 'NONE', true),
(8, 2, 2, 'VIRTUAL', 'WEDNESDAY', '09:00', '15:00', 'NONE', true),
(9, 2, 2, 'OFFLINE', 'THURSDAY', '08:00', '16:00', 'NONE', true),
(10, 2, 2, 'OFFLINE', 'FRIDAY', '08:00', '16:00', 'NONE', true),
(11, 3, 3, 'OFFLINE', 'MONDAY', '10:00', '18:00', 'NONE', true),
(12, 3, 3, 'VIRTUAL', 'TUESDAY', '11:00', '17:00', 'NONE', true),
(13, 3, 3, 'OFFLINE', 'WEDNESDAY', '10:00', '18:00', 'NONE', true),
(14, 3, 3, 'OFFLINE', 'THURSDAY', '10:00', '18:00', 'NONE', true),
(15, 3, 3, 'VIRTUAL', 'FRIDAY', '12:00', '16:00', 'NONE', true),
(16, 4, 4, 'OFFLINE', 'MONDAY', '09:00', '17:00', 'NONE', true),
(17, 4, 4, 'OFFLINE', 'TUESDAY', '09:00', '17:00', 'NONE', true),
(18, 4, 4, 'VIRTUAL', 'WEDNESDAY', '10:00', '16:00', 'NONE', true),
(19, 4, 4, 'OFFLINE', 'THURSDAY', '09:00', '17:00', 'NONE', true),
(20, 4, 4, 'OFFLINE', 'FRIDAY', '09:00', '17:00', 'NONE', true);

-- Reset sequences
SELECT setval('"Role_id_seq"', (SELECT MAX(id) FROM "Role"));
SELECT setval('"Location_id_seq"', (SELECT MAX(id) FROM "Location"));
SELECT setval('"Provider_id_seq"', (SELECT MAX(id) FROM "Provider"));
SELECT setval('"Patient_id_seq"', (SELECT MAX(id) FROM "Patient"));
SELECT setval('"Availability_id_seq"', (SELECT MAX(id) FROM "Availability")); 