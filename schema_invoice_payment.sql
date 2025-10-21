-- Add payment details to invoices
ALTER TABLE invoices ADD COLUMN bank_name TEXT;
ALTER TABLE invoices ADD COLUMN account_name TEXT;
ALTER TABLE invoices ADD COLUMN account_number TEXT;
ALTER TABLE invoices ADD COLUMN swift_code TEXT;
ALTER TABLE invoices ADD COLUMN payment_instructions TEXT;