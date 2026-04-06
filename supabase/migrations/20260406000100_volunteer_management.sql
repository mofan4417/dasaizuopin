CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username VARCHAR(100),
  phone VARCHAR(30),
  role VARCHAR(20) NOT NULL DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'reviewer', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  missions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100),
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_presence ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_select_all' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY user_profiles_select_all ON user_profiles
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_insert_all' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY user_profiles_insert_all ON user_profiles
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_update_all' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY user_profiles_update_all ON user_profiles
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'user_profiles_delete_all' AND tablename = 'user_profiles'
  ) THEN
    CREATE POLICY user_profiles_delete_all ON user_profiles
      FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_progress_select_all' AND tablename = 'volunteer_progress'
  ) THEN
    CREATE POLICY volunteer_progress_select_all ON volunteer_progress
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_progress_insert_all' AND tablename = 'volunteer_progress'
  ) THEN
    CREATE POLICY volunteer_progress_insert_all ON volunteer_progress
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_progress_update_all' AND tablename = 'volunteer_progress'
  ) THEN
    CREATE POLICY volunteer_progress_update_all ON volunteer_progress
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_presence_select_all' AND tablename = 'volunteer_presence'
  ) THEN
    CREATE POLICY volunteer_presence_select_all ON volunteer_presence
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_presence_insert_all' AND tablename = 'volunteer_presence'
  ) THEN
    CREATE POLICY volunteer_presence_insert_all ON volunteer_presence
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_presence_update_all' AND tablename = 'volunteer_presence'
  ) THEN
    CREATE POLICY volunteer_presence_update_all ON volunteer_presence
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteer_progress TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON volunteer_presence TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_volunteer_presence_last_seen ON volunteer_presence(last_seen DESC);
