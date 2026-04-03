-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for global/admin
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('admin', 'system')),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can mark their own notifications as read" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Update decks table to include type
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'decks' AND COLUMN_NAME = 'type') THEN
        ALTER TABLE public.decks ADD COLUMN type TEXT DEFAULT 'static' CHECK (type IN ('static', 'mcq', 'dynamic'));
    END IF;
END $$;
