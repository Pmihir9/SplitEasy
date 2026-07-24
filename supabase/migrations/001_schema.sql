-- ============================================================
-- SplitEase — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ── PEOPLE ──────────────────────────────────────────────────
CREATE TABLE people (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own people" ON people FOR ALL USING (user_id = auth.uid());

-- ── FRIENDSHIPS ─────────────────────────────────────────────
CREATE TABLE friendships (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id  UUID REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own friendships" ON friendships FOR ALL USING (user_id = auth.uid());

-- ── GROUPS ──────────────────────────────────────────────────
CREATE TABLE groups (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  type       TEXT DEFAULT '📦',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own groups" ON groups FOR ALL USING (user_id = auth.uid());

-- ── GROUP MEMBERS ────────────────────────────────────────────
CREATE TABLE group_members (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id   UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  person_id  UUID REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(group_id, person_id)
);
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group owners manage members" ON group_members FOR ALL
  USING (group_id IN (SELECT id FROM groups WHERE user_id = auth.uid()));

-- ── EXPENSES ────────────────────────────────────────────────
CREATE TABLE expenses (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  category    TEXT DEFAULT '📦 Other',
  paid_by     UUID NOT NULL,
  group_id    UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON expenses FOR ALL USING (user_id = auth.uid());

-- ── EXPENSE SPLITS ───────────────────────────────────────────
CREATE TABLE expense_splits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id  UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  person_id   UUID NOT NULL,
  amount      NUMERIC(12,2) NOT NULL
);
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see splits for own expenses" ON expense_splits FOR ALL
  USING (expense_id IN (SELECT id FROM expenses WHERE user_id = auth.uid()));

-- ── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE payments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_id    UUID NOT NULL,
  to_id      UUID NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own payments" ON payments FOR ALL USING (user_id = auth.uid());

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_expenses_user     ON expenses(user_id);
CREATE INDEX idx_expenses_group    ON expenses(group_id);
CREATE INDEX idx_splits_expense    ON expense_splits(expense_id);
CREATE INDEX idx_payments_user     ON payments(user_id);
CREATE INDEX idx_friendships_user  ON friendships(user_id);
