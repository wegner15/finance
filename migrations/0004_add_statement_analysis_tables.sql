-- Migration for M-Pesa statement ingestion and categorization
CREATE TABLE statement_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'mpesa',
    file_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    total_transactions INTEGER NOT NULL DEFAULT 0,
    categorized_transactions INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
);

CREATE TABLE statement_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    upload_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    external_ref TEXT,
    tx_date DATETIME NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    direction TEXT CHECK(direction IN ('debit', 'credit')) NOT NULL,
    balance REAL,
    counterparty TEXT,
    raw_line TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    confidence REAL DEFAULT 0,
    method TEXT CHECK(method IN ('rule', 'ai', 'manual')) NOT NULL,
    reason TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE category_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    previous_category TEXT,
    new_category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_statement_uploads_user_id ON statement_uploads(user_id);
CREATE INDEX idx_statement_transactions_upload_id ON statement_transactions(upload_id);
CREATE INDEX idx_statement_transactions_user_id ON statement_transactions(user_id);
CREATE INDEX idx_statement_transactions_tx_date ON statement_transactions(tx_date);
CREATE INDEX idx_transaction_categories_tx_id ON transaction_categories(transaction_id);
CREATE INDEX idx_category_feedback_tx_id ON category_feedback(transaction_id);
