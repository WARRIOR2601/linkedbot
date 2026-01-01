-- Create upcoming_events table for planning purposes
CREATE TABLE public.upcoming_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.upcoming_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own events" 
ON public.upcoming_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events" 
ON public.upcoming_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
ON public.upcoming_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
ON public.upcoming_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_upcoming_events_updated_at
BEFORE UPDATE ON public.upcoming_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();