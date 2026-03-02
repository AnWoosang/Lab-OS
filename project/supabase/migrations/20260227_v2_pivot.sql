-- ============================================================
-- Lab-OS v2 Migration: Pivot to Web-based Upload
-- Removes: Slack, Notion columns
-- Adds: users, upload_sessions, role-based auth, join_code
-- ============================================================

-- Drop all old tables (clean slate)
DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS upload_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- ─── generate_join_code() function ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_join_code() RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  text := '';
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ─── workspaces ──────────────────────────────────────────────────────────────
CREATE TABLE workspaces (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_name   text NOT NULL,
  join_code  text UNIQUE NOT NULL DEFAULT generate_join_code(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- ─── users ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  role         text NOT NULL CHECK (role IN ('professor', 'student')),
  name         text,
  email        text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own workspace"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users read own profile"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users insert own profile"
  ON users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- ─── projects ────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id     uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_code     text NOT NULL,
  project_name     text,
  lead_student     text,
  status           text DEFAULT 'on_track' CHECK (status IN ('on_track', 'warning', 'red_zone')),
  risk_score       integer DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  bottleneck       text,
  budget_total     numeric DEFAULT 0,
  budget_used      numeric DEFAULT 0,
  start_date       date,
  end_date         date,
  external_summary text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (workspace_id, project_code)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members read projects"
  ON projects FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Workspace members insert projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Professors update projects"
  ON projects FOR UPDATE TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid() AND role = 'professor'));

-- ─── upload_sessions ─────────────────────────────────────────────────────────
CREATE TABLE upload_sessions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id   uuid REFERENCES projects(id) ON DELETE SET NULL,
  file_name    text NOT NULL,
  file_url     text,
  result_type  text CHECK (result_type IN ('report', 'expense', 'unknown')),
  result_data  jsonb,
  status       text DEFAULT 'processing' CHECK (status IN ('processing', 'done', 'error')),
  error_msg    text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own upload sessions"
  ON upload_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── reports ─────────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id      uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date       date,
  content           text,
  progress          integer CHECK (progress BETWEEN 0 AND 100),
  file_url          text,
  upload_session_id uuid REFERENCES upload_sessions(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members read reports"
  ON reports FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Workspace members insert reports"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- ─── expenses ────────────────────────────────────────────────────────────────
CREATE TABLE expenses (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id  uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount        numeric NOT NULL DEFAULT 0,
  vendor        text,
  receipt_url   text,
  category      text CHECK (category IN ('소모품', '식비', '출장비', '학회비', '장비구매')),
  budget_code   text,
  is_suspicious boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members read expenses"
  ON expenses FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Workspace members insert expenses"
  ON expenses FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- ─── actions ─────────────────────────────────────────────────────────────────
CREATE TABLE actions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trigger_type text CHECK (trigger_type IN ('late_report', 'low_progress', 'budget_overrun')),
  status       text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'resolved')),
  gmail_thread text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors manage actions"
  ON actions FOR ALL TO authenticated
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid() AND role = 'professor'))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid() AND role = 'professor'));

-- ─── Storage: lab-files bucket ───────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-files', 'lab-files', false)
ON CONFLICT (id) DO NOTHING;
