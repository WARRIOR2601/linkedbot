-- Create posts table
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    ai_model text NOT NULL,
    tags text[] DEFAULT '{}',
    hashtags text[] DEFAULT '{}',
    post_length text NOT NULL DEFAULT 'medium' CHECK (post_length IN ('short', 'medium', 'long')),
    guidance text,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled')),
    scheduled_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for posts
CREATE POLICY "Users can view their own posts"
ON public.posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create AI training updates table
CREATE TABLE public.ai_training_updates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    update_type text NOT NULL DEFAULT 'general' CHECK (update_type IN ('general', 'tone', 'focus', 'business')),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ai_training_updates
ALTER TABLE public.ai_training_updates ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_training_updates
CREATE POLICY "Users can view their own training updates"
ON public.ai_training_updates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training updates"
ON public.ai_training_updates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training updates"
ON public.ai_training_updates FOR DELETE
USING (auth.uid() = user_id);