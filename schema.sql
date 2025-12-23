-- Schema for Accounting Platform

-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    client_id INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT
);

-- Transactions table (income/expenses)
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    receipt_id INTEGER
);

-- Companies table
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT -- URL to R2
);

-- Invoices table
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    client_id INTEGER,
    company_id INTEGER,
    amount REAL NOT NULL,
    status TEXT CHECK(status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'draft',
    due_date DATE,
    items TEXT, -- JSON string for invoice items
    currency TEXT DEFAULT 'KSH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Receipts table
CREATE TABLE receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    client_id INTEGER,
    image_url TEXT, -- URL to R2
    amount REAL,
    status TEXT CHECK(status IN ('draft', 'sent', 'paid')) DEFAULT 'draft',
    date DATE,
    items TEXT, -- JSON string for receipt items
    description TEXT,
    notes TEXT
);

-- Quotes table
CREATE TABLE quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    client_id INTEGER,
    company_id INTEGER,
    title TEXT NOT NULL,
    introduction TEXT,
    scope_summary TEXT,
    deliverables TEXT, -- JSON array of deliverables with descriptions
    items TEXT, -- Enhanced JSON for cost breakdown with categories
    payment_terms TEXT, -- JSON array of payment milestones
    validity_period INTEGER DEFAULT 30, -- Days quote is valid
    conclusion TEXT,
    notes TEXT, -- Additional terms/conditions
    amount REAL NOT NULL,
    status TEXT CHECK(status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')) DEFAULT 'draft',
    sent_at DATETIME,
    accepted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);