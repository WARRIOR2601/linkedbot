-- Add new status values to scheduled_posts
ALTER TABLE public.scheduled_posts 
DROP CONSTRAINT IF EXISTS scheduled_posts_status_check;

ALTER TABLE public.scheduled_posts 
ADD CONSTRAINT scheduled_posts_status_check 
CHECK (status IN ('pending', 'published', 'failed', 'paused', 'skipped'));

-- Add global agent toggle to client_ai_profiles (since we use this table, not profiles)
ALTER TABLE public.client_ai_profiles 
ADD COLUMN IF NOT EXISTS agent_active boolean DEFAULT false;