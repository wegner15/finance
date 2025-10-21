-- Schema update for enhanced quotes functionality

-- Add new columns to existing quotes table
ALTER TABLE quotes ADD COLUMN company_id INTEGER;
ALTER TABLE quotes ADD COLUMN title TEXT DEFAULT 'Project Quote';
ALTER TABLE quotes ADD COLUMN introduction TEXT;
ALTER TABLE quotes ADD COLUMN scope_summary TEXT;
ALTER TABLE quotes ADD COLUMN deliverables TEXT; -- JSON array
ALTER TABLE quotes ADD COLUMN payment_terms TEXT; -- JSON array
ALTER TABLE quotes ADD COLUMN validity_period INTEGER DEFAULT 30;
ALTER TABLE quotes ADD COLUMN conclusion TEXT;
ALTER TABLE quotes ADD COLUMN notes TEXT;
ALTER TABLE quotes ADD COLUMN sent_at DATETIME;
ALTER TABLE quotes ADD COLUMN accepted_at DATETIME;
ALTER TABLE quotes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Update existing quotes to have a default title
UPDATE quotes SET title = 'Project Quote #' || id WHERE title IS NULL;

-- Update status check constraint to include 'expired'
-- Note: SQLite doesn't support ALTER CONSTRAINT, so we'll handle this in application logic