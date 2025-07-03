
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

-- Create default General buckets for all users who have tasks but no default bucket
INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
SELECT DISTINCT t.user_id, 'General', '#6b7280', 0, true
FROM public.tasks t
WHERE t.user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.buckets 
  WHERE is_default = true
)
ON CONFLICT DO NOTHING;

-- Also create default buckets for any existing users who might not have tasks yet
INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
SELECT DISTINCT user_id, 'General', '#6b7280', 0, true
FROM auth.users
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.buckets 
  WHERE is_default = true
)
ON CONFLICT DO NOTHING;

-- Assign all tasks without bucket_id to their user's default General bucket
UPDATE public.tasks 
SET bucket_id = (
  SELECT b.id 
  FROM public.buckets b 
  WHERE b.user_id = tasks.user_id 
  AND b.is_default = true 
  LIMIT 1
)
WHERE bucket_id IS NULL;

-- Ensure no user has more than one default bucket (cleanup any duplicates)
DELETE FROM public.buckets 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM public.buckets 
  WHERE is_default = true 
  GROUP BY user_id
) 
AND is_default = true;
