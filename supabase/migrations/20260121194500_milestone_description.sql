-- Add description to milestones table safely
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='milestones' AND column_name='description') THEN 
        ALTER TABLE public.milestones ADD COLUMN description text; 
    END IF; 
END $$;
