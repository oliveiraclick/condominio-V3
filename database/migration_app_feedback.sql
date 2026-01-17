CREATE TABLE IF NOT EXISTS app_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    area TEXT NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert feedback" ON app_feedback;
CREATE POLICY "Users can insert feedback" ON app_feedback
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "SuperAdmins can view feedback" ON app_feedback;
CREATE POLICY "SuperAdmins can view feedback" ON app_feedback
    FOR SELECT TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin' OR
        (SELECT email FROM profiles WHERE id = auth.uid()) = 'denys@morador.com.br'
    );

DROP POLICY IF EXISTS "SuperAdmins can update feedback" ON app_feedback;
CREATE POLICY "SuperAdmins can update feedback" ON app_feedback
    FOR UPDATE TO authenticated
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin' OR
        (SELECT email FROM profiles WHERE id = auth.uid()) = 'denys@morador.com.br'
    );


