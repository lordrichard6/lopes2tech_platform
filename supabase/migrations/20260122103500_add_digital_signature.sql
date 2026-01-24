-- Add digital signature tracking to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_date TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_ip TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_user_agent TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS acceptance_token UUID DEFAULT gen_random_uuid();

-- Create index for token lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_acceptance_token ON documents(acceptance_token);

COMMENT ON COLUMN documents.signature_name IS 'Name of the person who signed the document';
COMMENT ON COLUMN documents.signature_date IS 'Timestamp when document was signed';
COMMENT ON COLUMN documents.signature_ip IS 'IP address of the signer';
COMMENT ON COLUMN documents.signature_user_agent IS 'Browser user agent of the signer';
COMMENT ON COLUMN documents.acceptance_token IS 'Unique token for the document acceptance URL';
