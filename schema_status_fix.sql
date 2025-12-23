-- Add missing status timestamp columns
ALTER TABLE quotes ADD COLUMN sent_at DATETIME;
ALTER TABLE quotes ADD COLUMN accepted_at DATETIME;
ALTER TABLE quotes ADD COLUMN updated_at DATETIME;
