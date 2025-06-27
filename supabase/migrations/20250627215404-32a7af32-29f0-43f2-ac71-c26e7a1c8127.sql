
-- Add bucket_id column to tasks table
ALTER TABLE public.tasks ADD COLUMN bucket_id UUID REFERENCES public.buckets(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_tasks_bucket_id ON public.tasks(bucket_id);

-- Update all existing tasks to be assigned to the default "General Tasks" bucket
-- First, ensure we have a default bucket for each user
INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
SELECT DISTINCT user_id, 'General Tasks', '#3b82f6', 0, true
FROM public.tasks
WHERE user_id NOT IN (SELECT DISTINCT user_id FROM public.buckets WHERE is_default = true)
ON CONFLICT DO NOTHING;

-- Now assign all tasks without bucket_id to their user's default bucket
UPDATE public.tasks 
SET bucket_id = (
  SELECT b.id 
  FROM public.buckets b 
  WHERE b.user_id = tasks.user_id 
  AND b.is_default = true 
  LIMIT 1
)
WHERE bucket_id IS NULL;
