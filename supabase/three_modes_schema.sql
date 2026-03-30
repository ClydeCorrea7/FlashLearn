-- 1. Enable types if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_mode') THEN
        CREATE TYPE learning_mode AS ENUM ('static', 'dynamic', 'mcq');
    END IF;
END $$;

-- 2. Update 'decks' table
ALTER TABLE decks 
ADD COLUMN IF NOT EXISTS preferred_mode learning_mode DEFAULT 'static';

-- 3. Update 'cards' table with adaptive metrics
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS strength_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS next_review_due TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS correct_attempts INT DEFAULT 0;

-- 4. Create 'card_attempts' table for granular tracking
CREATE TABLE IF NOT EXISTS card_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    response_time INT, -- in milliseconds
    confidence TEXT CHECK (confidence IN ('easy', 'medium', 'hard')),
    mode learning_mode NOT NULL DEFAULT 'static',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. RLS Policies for card_attempts
ALTER TABLE card_attempts ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'card_attempts' AND policyname = 'Users can view their own card attempts'
    ) THEN
        CREATE POLICY "Users can view their own card attempts" ON card_attempts
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'card_attempts' AND policyname = 'Users can insert their own card attempts'
    ) THEN
        CREATE POLICY "Users can insert their own card attempts" ON card_attempts
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Performance Index
CREATE INDEX IF NOT EXISTS idx_card_attempts_user_card ON card_attempts(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(next_review_due);
