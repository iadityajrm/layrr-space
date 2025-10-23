-- Create tickets table for support requests
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_email text,
  subject text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Optional index to search open tickets quickly
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
