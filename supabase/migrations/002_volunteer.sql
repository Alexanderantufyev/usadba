-- ══════════════════════════════════════════════════════════
--  Волонтёрский модуль
-- ══════════════════════════════════════════════════════════

CREATE TABLE volunteer_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  task_date       DATE NOT NULL,
  location        TEXT NOT NULL DEFAULT '',
  tools_info      TEXT NOT NULL DEFAULT '',   -- что взять с собой / какие инструменты
  max_volunteers  INTEGER NOT NULL DEFAULT 10,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE volunteer_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES volunteer_tasks(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  arrival_time  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Индексы
CREATE INDEX idx_vtasks_date     ON volunteer_tasks(task_date);
CREATE INDEX idx_vreg_task       ON volunteer_registrations(task_id);
CREATE INDEX idx_vreg_email      ON volunteer_registrations(email);

-- Автообновление updated_at
CREATE TRIGGER volunteer_tasks_updated_at
  BEFORE UPDATE ON volunteer_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE volunteer_tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations  ENABLE ROW LEVEL SECURITY;

-- Задачи: читать могут все (публичный сайт), писать — только авторизованные
CREATE POLICY "tasks_public_read"
  ON volunteer_tasks FOR SELECT USING (true);

CREATE POLICY "tasks_auth_write"
  ON volunteer_tasks FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Регистрации: добавлять может кто угодно, читать — только авторизованные
CREATE POLICY "regs_public_insert"
  ON volunteer_registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "regs_auth_select"
  ON volunteer_registrations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "regs_auth_delete"
  ON volunteer_registrations FOR DELETE
  TO authenticated USING (true);
