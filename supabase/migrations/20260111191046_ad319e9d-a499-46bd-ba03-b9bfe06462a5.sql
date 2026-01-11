-- Extension sessions for Chrome extension authentication
CREATE TABLE public.extension_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.extension_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own extension sessions"
ON public.extension_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own extension sessions"
ON public.extension_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extension sessions"
ON public.extension_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all sessions (for extension auth)
CREATE POLICY "Service role can manage extension sessions"
ON public.extension_sessions
FOR ALL
USING (auth.role() = 'service_role');

-- Index for token lookup
CREATE INDEX idx_extension_sessions_token ON public.extension_sessions(token);
CREATE INDEX idx_extension_sessions_user_id ON public.extension_sessions(user_id);
CREATE INDEX idx_extension_sessions_expires_at ON public.extension_sessions(expires_at);

-- Scheduled posts table (separate from posts for extension workflow)
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own scheduled posts"
ON public.scheduled_posts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled posts"
ON public.scheduled_posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
ON public.scheduled_posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
ON public.scheduled_posts
FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all posts (for extension API)
CREATE POLICY "Service role can manage scheduled posts"
ON public.scheduled_posts
FOR ALL
USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_for ON public.scheduled_posts(scheduled_for);

-- Trigger for updated_at
CREATE TRIGGER update_scheduled_posts_updated_at
BEFORE UPDATE ON public.scheduled_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- LinkedIn analytics table
CREATE TABLE public.linkedin_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  connections INTEGER NOT NULL DEFAULT 0,
  posts INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linkedin_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own analytics"
ON public.linkedin_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics"
ON public.linkedin_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role can manage all analytics (for extension API)
CREATE POLICY "Service role can manage analytics"
ON public.linkedin_analytics
FOR ALL
USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_linkedin_analytics_user_id ON public.linkedin_analytics(user_id);
CREATE INDEX idx_linkedin_analytics_captured_at ON public.linkedin_analytics(captured_at);