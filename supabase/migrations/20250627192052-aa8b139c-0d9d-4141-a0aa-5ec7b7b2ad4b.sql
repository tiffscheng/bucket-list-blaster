
-- Fix Function Search Path Mutable warning by setting the search path for the public schema
-- This applies to functions we create, not the system-wide database setting
ALTER ROLE authenticator SET search_path = public;
ALTER ROLE anon SET search_path = public;
ALTER ROLE authenticated SET search_path = public;

-- Create a function to demonstrate secure search path handling
CREATE OR REPLACE FUNCTION public.secure_function_example()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'Function with secure search path';
END;
$$;
