-- 1. Reviews Table (System of Satisfaction/Reputation)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- RLS for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients can create reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

-- 2. Transactions Table (Financial Control for Super Admin / Professional)
CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id), -- Who paid (or who received if withdrawal)
  amount numeric(10,2) NOT NULL,
  type text CHECK (type IN ('credit', 'debit')), -- credit = platform receives, debit = platform pays out
  description text,
  status text DEFAULT 'completed', -- completed, pending
  created_at timestamptz DEFAULT now()
);

-- RLS for Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');
CREATE POLICY "Super Admin can manage transactions" ON transactions FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- 3. Verified Badge for Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- 4. Subscription Fields (Enhancement)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'trial'; -- trial, pro
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance numeric(10,2) DEFAULT 0.00; -- Internal wallet balance
