-- Tasks Management Module Migration
-- Created: 2026-01-31

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conteúdo
  title TEXT NOT NULL,
  description TEXT,

  category TEXT NOT NULL, -- manutenção, limpeza, segurança, infraestrutura, outros
  priority TEXT NOT NULL DEFAULT 'normal', -- baixa | normal | alta | urgente

  status TEXT NOT NULL DEFAULT 'open',
  -- open | analysis | approval | in_progress | done

  -- Fluxo
  requires_approval BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),

  -- Responsáveis
  created_by UUID REFERENCES profiles(id) NOT NULL,
  assigned_to UUID REFERENCES profiles(id),

  -- Datas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,

  -- Contexto (onde aconteceu)
  location TEXT,        -- ex: Quiosque, Portaria, Bloco A
  unit TEXT,            -- opcional
  tower TEXT,           -- opcional

  -- Controle
  archived BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status) WHERE archived = false;
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to) WHERE archived = false;
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_category ON tasks(category) WHERE archived = false;
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_priority ON tasks(priority) WHERE archived = false;

-- Task attachments table (photos, files)
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'photo' | 'document'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);

-- RLS for attachments
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and employees can manage attachments"
  ON task_attachments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'employee')
    )
  );

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Admin and employees can manage all tasks
CREATE POLICY "Admin and employees can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'employee')
    )
  );

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- Comments for documentation
COMMENT ON TABLE tasks IS 'Internal task management for condominium operations';
COMMENT ON COLUMN tasks.status IS 'open | analysis | approval | in_progress | done';
COMMENT ON COLUMN tasks.priority IS 'baixa | normal | alta | urgente';
COMMENT ON COLUMN tasks.category IS 'manutenção | limpeza | segurança | infraestrutura | outros';
