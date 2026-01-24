-- Add salt column for proper encryption key derivation
-- This column stores the random salt used to derive the encryption key for each credential

ALTER TABLE credentials ADD COLUMN IF NOT EXISTS salt TEXT;

-- For existing records (if any), we'll need to re-encrypt them with proper salt
-- This is a one-time migration concern. New records will have salt populated.
COMMENT ON COLUMN credentials.salt IS 'Random salt used for scrypt key derivation';
