-- Internal Notes table for tracking client interactions
-- Stores call logs, meeting notes, and general notes about clients

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'call', 'meeting', 'email')),
    title TEXT NOT NULL,
    content TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries by client
CREATE INDEX IF NOT EXISTS notes_client_id_idx ON notes(client_id);
CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes(created_at DESC);

-- RLS Policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all notes"
    ON notes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at_trigger
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();
