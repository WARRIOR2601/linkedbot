-- Add new columns to posts table for LinkedIn posting
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS linkedin_post_id TEXT,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;

-- Update status to include new states
-- First, update any existing scheduled/draft values to ensure compatibility
-- Then we'll handle the new states in application code

-- Create linkedin_accounts table for storing connection info
CREATE TABLE public.linkedin_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  linkedin_user_id TEXT,
  profile_name TEXT,
  profile_photo_url TEXT,
  headline TEXT,
  followers_count INTEGER,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.linkedin_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for linkedin_accounts
CREATE POLICY "Users can view their own LinkedIn account" 
ON public.linkedin_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn account" 
ON public.linkedin_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn account" 
ON public.linkedin_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn account" 
ON public.linkedin_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_linkedin_accounts_updated_at
BEFORE UPDATE ON public.linkedin_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();