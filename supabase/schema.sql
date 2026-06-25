-- ZeroDay Arena Database Schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  points integer NOT NULL,
  difficulty text NOT NULL,
  description text NOT NULL,
  url text,
  file_url text,
  flag_hash text NOT NULL,
  visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  submitted_flag text NOT NULL,
  correct boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Solves
CREATE TABLE IF NOT EXISTS solves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  points integer NOT NULL,
  solved_at timestamptz DEFAULT now(),
  UNIQUE (team_id, challenge_id)
);

-- Event Settings (single row)
CREATE TABLE IF NOT EXISTS event_settings (
  id integer PRIMARY KEY DEFAULT 1,
  event_name text NOT NULL DEFAULT 'ZeroDay Arena: Friendly Duel #01',
  start_time timestamptz,
  end_time timestamptz,
  scoreboard_frozen boolean DEFAULT false,
  CONSTRAINT event_settings_single_row CHECK (id = 1)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solves_team_id ON solves(team_id);
CREATE INDEX IF NOT EXISTS idx_solves_challenge_id ON solves(challenge_id);
CREATE INDEX IF NOT EXISTS idx_solves_solved_at ON solves(solved_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_visible ON challenges(visible);
CREATE INDEX IF NOT EXISTS idx_challenges_slug ON challenges(slug);
CREATE INDEX IF NOT EXISTS idx_challenges_sort_order ON challenges(sort_order);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);

-- updated_at trigger for challenges
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS challenges_updated_at ON challenges;
CREATE TRIGGER challenges_updated_at
  BEFORE UPDATE ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenges_updated_at();

-- Insert default event settings
INSERT INTO event_settings (id, event_name)
VALUES (1, 'ZeroDay Arena: Friendly Duel #01')
ON CONFLICT (id) DO NOTHING;

-- RLS: disabled by default — all sensitive access goes through server-side API routes
-- using the service role key. Do not query teams/challenges/submissions/solves from the
-- browser with the anon key.
