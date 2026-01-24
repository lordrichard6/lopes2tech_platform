-- Add status tracking columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'other';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES documents(id);

-- Create index for faster document type queries
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

COMMENT ON COLUMN documents.status IS 'Document lifecycle status: draft, sent, viewed, signed';
COMMENT ON COLUMN documents.document_type IS 'Type of document: proposal, contract, welcome_package, handover, support_agreement, invoice, other';
