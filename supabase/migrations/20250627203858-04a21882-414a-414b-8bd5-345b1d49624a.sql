
-- Create a table for custom buckets
CREATE TABLE public.buckets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on buckets table
ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies for buckets
CREATE POLICY "Users can view their own buckets" ON public.buckets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buckets" ON public.buckets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buckets" ON public.buckets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own buckets" ON public.buckets
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_buckets_user_id_order ON public.buckets(user_id, order_index);

-- Insert a default "General Tasks" bucket for existing users
INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
SELECT id, 'General Tasks', '#3b82f6', 0, true
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.buckets WHERE is_default = true);
