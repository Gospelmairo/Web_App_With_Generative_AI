
-- First, drop the trigger that uses the enum
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Add a new column with string type
ALTER TABLE public.users ADD COLUMN user_type_new TEXT NOT NULL DEFAULT 'patient';

-- Copy data from the enum column to the new string column
UPDATE public.users SET user_type_new = user_type::text;

-- Drop the old enum column
ALTER TABLE public.users DROP COLUMN user_type;

-- Rename the new column to the original name
ALTER TABLE public.users RENAME COLUMN user_type_new TO user_type;

-- Drop the enum type (if no other tables are using it)
DROP TYPE IF EXISTS public.user_type;

-- Recreate the trigger function with string type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, user_type, email, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'patient'),
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
