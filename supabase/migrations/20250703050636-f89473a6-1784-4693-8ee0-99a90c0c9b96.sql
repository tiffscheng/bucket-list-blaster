
-- First, identify and fix tasks assigned to buckets that don't belong to the same user
-- Remove bucket assignments where the bucket doesn't belong to the task's user
UPDATE public.tasks 
SET bucket_id = NULL
WHERE bucket_id IS NOT NULL 
AND bucket_id NOT IN (
  SELECT b.id 
  FROM public.buckets b 
  WHERE b.user_id = tasks.user_id
);

-- Now assign all tasks without bucket_id to their user's default General bucket
UPDATE public.tasks 
SET bucket_id = (
  SELECT b.id 
  FROM public.buckets b 
  WHERE b.user_id = tasks.user_id 
  AND b.is_default = true 
  LIMIT 1
)
WHERE bucket_id IS NULL;

-- For any users who might not have a default bucket yet (edge case)
-- Create default General buckets for users who have tasks but no default bucket
INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
SELECT DISTINCT t.user_id, 'General', '#6b7280', 0, true
FROM public.tasks t
WHERE t.user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.buckets 
  WHERE is_default = true
)
ON CONFLICT DO NOTHING;

-- Final pass: assign any remaining unassigned tasks to their user's default bucket
UPDATE public.tasks 
SET bucket_id = (
  SELECT b.id 
  FROM public.buckets b 
  WHERE b.user_id = tasks.user_id 
  AND b.is_default = true 
  LIMIT 1
)
WHERE bucket_id IS NULL;
