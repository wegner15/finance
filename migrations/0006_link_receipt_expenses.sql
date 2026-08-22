-- Migration number: 0006 	 2026-04-30T12:21:00.000Z
-- `receipt_id` is already present in the current schema/runtime bootstrap.
-- Keep this migration focused on the supporting index so it remains safe to rerun.
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_id ON transactions(receipt_id);
