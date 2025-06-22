
-- Create the user_type enum (will error if it already exists, but that's okay)
DO $$ 
BEGIN
    CREATE TYPE public.user_type AS ENUM ('patient', 'provider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the user_type column to the existing users table
ALTER TABLE public.users 
ADD COLUMN user_type user_type NOT NULL DEFAULT 'patient';
