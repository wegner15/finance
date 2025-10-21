-- Add companies table and company_id to invoices

CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT, -- URL to R2
    FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE invoices ADD COLUMN company_id INTEGER REFERENCES companies(id);

-- Add payment information to receipts
ALTER TABLE receipts ADD COLUMN payment_method TEXT;
ALTER TABLE receipts ADD COLUMN reference_number TEXT;

-- Add payment details to invoices
ALTER TABLE invoices ADD COLUMN bank_name TEXT;
ALTER TABLE invoices ADD COLUMN account_name TEXT;
ALTER TABLE invoices ADD COLUMN account_number TEXT;
ALTER TABLE invoices ADD COLUMN swift_code TEXT;
ALTER TABLE invoices ADD COLUMN payment_instructions TEXT;