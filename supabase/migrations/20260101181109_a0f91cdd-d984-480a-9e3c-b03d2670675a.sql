-- Create agents table for autonomous posting
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL DEFAULT 'professional',
  posting_goal TEXT,
  tone_of_voice TEXT,
  topics TEXT[] DEFAULT '{}',
  posting_frequency TEXT NOT NULL DEFAULT 'daily',
  preferred_posting_days INTEGER[] DEFAULT '{1,2,3,4,5}',
  preferred_time_window_start TIME DEFAULT '09:00:00',
  preferred_time_window_end TIME DEFAULT '17:00:00',
  status TEXT NOT NULL DEFAULT 'paused',
  last_post_at TIMESTAMP WITH TIME ZONE,
  posts_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent training data table
CREATE TABLE public.agent_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  training_type TEXT NOT NULL DEFAULT 'sample_post',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add agent_id to posts table for tracking which agent created the post
ALTER TABLE public.posts ADD COLUMN agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Enable RLS on agents
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- RLS policies for agents
CREATE POLICY "Users can view their own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on agent_training_data
ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_training_data
CREATE POLICY "Users can view their own agent training data"
  ON public.agent_training_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent training data"
  ON public.agent_training_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent training data"
  ON public.agent_training_data FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for agents updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();