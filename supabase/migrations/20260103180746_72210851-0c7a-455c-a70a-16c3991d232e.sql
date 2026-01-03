-- Add Ayrshare fields to linkedin_accounts table
ALTER TABLE public.linkedin_accounts 
ADD COLUMN IF NOT EXISTS ayrshare_profile_key TEXT,
ADD COLUMN IF NOT EXISTS ayrshare_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ayrshare_connected_at TIMESTAMP WITH TIME ZONE;