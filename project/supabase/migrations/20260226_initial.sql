-- ============================================================
-- Lab-OS Initial Migration
-- 실행 방법: Supabase MCP 또는 SQL Editor에 붙여넣기
-- ============================================================

-- ─── workspaces (멀티테넌시 핵심) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workspaces (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slack_team_id       text UNIQUE NOT NULL,
  slack_team_name     text,
  slack_bot_token     text NOT NULL,
  notion_db_projects  text,
  notion_db_reports   text,
  notion_db_expenses  text,
  notion_db_actions   text,
  is_configured       boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- ─── projects ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
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

-- ─── reports ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date  date NOT NULL,
  content      text,
  progress     integer CHECK (progress BETWEEN 0 AND 100),
  file_url     text,
  slack_ts     text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ─── expenses ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount       numeric NOT NULL DEFAULT 0,
  vendor       text,
  receipt_url  text,
  category     text CHECK (category IN ('소모품', '식비', '출장비', '학회비', '장비구매')),
  budget_code  text,
  is_suspicious boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ─── actions ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS actions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trigger_type text CHECK (trigger_type IN ('late_report', 'low_progress', 'budget_overrun')),
  status       text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'resolved')),
  gmail_thread text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- ─── Storage: lab-files 버킷 ─────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-files', 'lab-files', false)
ON CONFLICT (id) DO NOTHING;
