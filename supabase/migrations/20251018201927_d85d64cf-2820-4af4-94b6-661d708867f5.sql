-- Force types regeneration by altering table structure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS temp_col text;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS temp_col;