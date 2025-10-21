-- Add payment information to receipts
ALTER TABLE receipts ADD COLUMN payment_method TEXT;
ALTER TABLE receipts ADD COLUMN reference_number TEXT;