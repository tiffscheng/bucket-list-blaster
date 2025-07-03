
-- Ensure every user has a default General bucket
INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
SELECT DISTINCT user_id, 'General', '#6b7280', 0, true
FROM public.tasks
WHERE user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.buckets 
  WHERE is_default = true
)
ON CONFLICT DO NOTHING;

-- Update all tasks without bucket_id to be assigned to their user's default bucket
UPDATE public.tasks 
SET bucket_id = (
  SELECT b.id 
  FROM public.buckets b 
  WHERE b.user_id = tasks.user_id 
  AND b.is_default = true 
  LIMIT 1
)
WHERE bucket_id IS NULL 
AND user_id IN (SELECT DISTINCT user_id FROM public.buckets WHERE is_default = true);

-- For any remaining tasks without buckets (edge case), create a General bucket and assign
WITH missing_users AS (
  SELECT DISTINCT user_id
  FROM public.tasks
  WHERE bucket_id IS NULL
),
new_buckets AS (
  INSERT INTO public.buckets (user_id, name, color, order_index, is_default)
  SELECT user_id, 'General', '#6b7280', 0, true
  FROM missing_users
  RETURNING id, user_id
)
UPDATE public.tasks 
SET bucket_id = new_buckets.id
FROM new_buckets
WHERE tasks.user_id = new_buckets.user_id 
AND tasks.bucket_id IS NULL;
