/*
  # Create users table and auth trigger

  This migration sets up the `users` table to store public profile data,
  links it to the `auth.users` table, and creates a trigger to automatically
  populate a new user's profile upon signup.

  1. New Tables
    - `users`
      - `id` (uuid, primary key): References `auth.users.id`.
      - `full_name` (text): User's full name.
      - `email` (text, unique): User's email address.
      - `upi_id` (text): UPI ID for payouts.
      - `phone_number` (text): User's mobile number.
      - `total_earnings` (numeric): Total earnings, defaults to 0.
      - `created_at` (timestamptz): Timestamp of creation.

  2. New Functions &amp; Triggers
    - `public.handle_new_user()`: A function that inserts a new row into `public.users` when a new user signs up in `auth.users`. It pulls data from the `raw_user_meta_data`.
    - `on_auth_user_created` trigger: Executes `handle_new_user` after a new user is inserted into `auth.users`.

  3. Security
    - Enable RLS on `users` table.
    - Add policy "Users can view their own profile.": Allows users to select their own data.
    - Add policy "Users can update their own profile.": Allows users to update their own data.
*/

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  upi_id text,
  phone_number text,
  total_earnings numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Function to create a public user profile upon auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, upi_id, phone_number)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'upi_id',
    new.raw_user_meta_data->>'phone_number'
  );
  return new;
end;
$$;

-- Trigger to execute the function upon new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own profile."
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
