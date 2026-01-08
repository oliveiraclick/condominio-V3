-- 1. DROP EVERYTHING FRESH (Ensures clean slate)
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
DROP POLICY IF EXISTS "Clients can create reviews" ON reviews;
DROP TABLE IF EXISTS reviews;

DROP POLICY IF EXISTS "Users can see own transactions" ON transactions;
DROP POLICY IF EXISTS "Super Admin can manage transactions" ON transactions;
DROP TABLE IF EXISTS transactions;

-- 2. RE-CREATE REVIEWS
CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

-- 3. RE-CREATE TRANSACTIONS
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  amount numeric(10,2) NOT NULL,
  type text CHECK (type IN ('credit', 'debit')),
  description text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');
CREATE POLICY "Super Admin can manage transactions" ON transactions FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 4. PROFILE COLUMNS (Safe adds)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'trial';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance numeric(10,2) DEFAULT 0.00;
