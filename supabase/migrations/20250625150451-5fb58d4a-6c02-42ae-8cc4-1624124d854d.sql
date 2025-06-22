
-- Ensure the user_type enum exists first
DO $$ 
BEGIN
    CREATE TYPE public.user_type AS ENUM ('patient', 'provider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Now drop and recreate the trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, user_type, email, first_name, last_name)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data ->> 'user_type')::user_type, 'patient'::user_type),
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
