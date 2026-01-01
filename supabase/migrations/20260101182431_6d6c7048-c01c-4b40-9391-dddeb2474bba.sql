-- Add new fields to agents table for extended agent creation
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS about_user TEXT,
ADD COLUMN IF NOT EXISTS about_company TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS sample_posts TEXT[],
ADD COLUMN IF NOT EXISTS auto_generate_images BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_text_only_posts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_image_style TEXT;