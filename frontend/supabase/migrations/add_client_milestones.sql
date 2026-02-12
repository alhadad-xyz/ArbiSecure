-- Migration: Add client and milestones fields to deals table
-- Description: Adds missing client wallet address and milestones array to support full deal creation workflow
-- Run this in Supabase Dashboard > SQL Editor

-- Add client column (wallet address of who will fund the deal)
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS client TEXT;

-- Add milestones column (JSONB array for structured milestone data)
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;

-- Add column comments for documentation
COMMENT ON COLUMN deals.client IS 'Wallet address of the client who will fund this deal';
COMMENT ON COLUMN deals.freelancer IS 'Wallet address of the freelancer who will receive payment';
COMMENT ON COLUMN deals.milestones IS 'Array of milestone objects with title, amount, and description';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'deals' 
ORDER BY ordinal_position;
