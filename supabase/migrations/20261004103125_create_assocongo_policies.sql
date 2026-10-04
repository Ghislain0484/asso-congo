-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ORGANIZATIONS policies
DROP POLICY IF EXISTS "orgs_select_public" ON organizations;
CREATE POLICY "orgs_select_public" ON organizations FOR SELECT TO anon, authenticated USING (deleted_at IS NULL AND status = 'active');
DROP POLICY IF EXISTS "orgs_select_members" ON organizations;
CREATE POLICY "orgs_select_members" ON organizations FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organizations.id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
CREATE POLICY "orgs_insert" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "orgs_update" ON organizations;
CREATE POLICY "orgs_update" ON organizations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organizations.id AND om.user_id = auth.uid() AND om.role IN ('admin','super_admin') AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organizations.id AND om.user_id = auth.uid() AND om.role IN ('admin','super_admin') AND om.deleted_at IS NULL));

-- ORGANIZATION_MEMBERS policies
DROP POLICY IF EXISTS "org_members_select" ON organization_members;
CREATE POLICY "org_members_select" ON organization_members FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.deleted_at IS NULL)));
DROP POLICY IF EXISTS "org_members_insert" ON organization_members;
CREATE POLICY "org_members_insert" ON organization_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "org_members_update" ON organization_members;
CREATE POLICY "org_members_update" ON organization_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.role = 'admin' AND om2.deleted_at IS NULL))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members om2 WHERE om2.organization_id = organization_members.organization_id AND om2.user_id = auth.uid() AND om2.role = 'admin' AND om2.deleted_at IS NULL));

-- MEMBERS policies
DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = members.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = members.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "members_update" ON members;
CREATE POLICY "members_update" ON members FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = members.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = members.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_delete" ON members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = members.organization_id AND om.user_id = auth.uid() AND om.role IN ('admin','super_admin') AND om.deleted_at IS NULL));

-- CAMPAIGNS policies
DROP POLICY IF EXISTS "campaigns_select_public" ON campaigns;
CREATE POLICY "campaigns_select_public" ON campaigns FOR SELECT TO anon, authenticated USING (deleted_at IS NULL AND status = 'active');
DROP POLICY IF EXISTS "campaigns_select_org" ON campaigns;
CREATE POLICY "campaigns_select_org" ON campaigns FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = campaigns.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "campaigns_insert" ON campaigns;
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = campaigns.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "campaigns_update" ON campaigns;
CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = campaigns.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = campaigns.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));

-- DONATIONS policies
DROP POLICY IF EXISTS "donations_select_public" ON donations;
CREATE POLICY "donations_select_public" ON donations FOR SELECT TO anon, authenticated USING (deleted_at IS NULL AND status = 'completed');
DROP POLICY IF EXISTS "donations_select_org" ON donations;
CREATE POLICY "donations_select_org" ON donations FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = donations.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "donations_insert" ON donations;
CREATE POLICY "donations_insert" ON donations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "donations_update" ON donations;
CREATE POLICY "donations_update" ON donations FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = donations.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = donations.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));

-- EVENTS policies
DROP POLICY IF EXISTS "events_select_public" ON events;
CREATE POLICY "events_select_public" ON events FOR SELECT TO anon, authenticated USING (deleted_at IS NULL AND status = 'active' AND is_public = true);
DROP POLICY IF EXISTS "events_select_org" ON events;
CREATE POLICY "events_select_org" ON events FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = events.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = events.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "events_update" ON events;
CREATE POLICY "events_update" ON events FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = events.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = events.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));

-- EVENT_REGISTRATIONS policies
DROP POLICY IF EXISTS "event_regs_select_org" ON event_registrations;
CREATE POLICY "event_regs_select_org" ON event_registrations FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = event_registrations.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "event_regs_insert" ON event_registrations;
CREATE POLICY "event_regs_insert" ON event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "event_regs_update" ON event_registrations;
CREATE POLICY "event_regs_update" ON event_registrations FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = event_registrations.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = event_registrations.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));

-- TRANSACTIONS policies
DROP POLICY IF EXISTS "tx_select_public" ON transactions;
CREATE POLICY "tx_select_public" ON transactions FOR SELECT TO anon, authenticated USING (deleted_at IS NULL AND status = 'success' AND type IN ('donation','tip'));
DROP POLICY IF EXISTS "tx_select_org" ON transactions;
CREATE POLICY "tx_select_org" ON transactions FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = transactions.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "tx_insert" ON transactions;
CREATE POLICY "tx_insert" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tx_update" ON transactions;
CREATE POLICY "tx_update" ON transactions FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = transactions.organization_id AND om.user_id = auth.uid() AND om.role IN ('admin','super_admin') AND om.deleted_at IS NULL))
  WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = transactions.organization_id AND om.user_id = auth.uid() AND om.role IN ('admin','super_admin') AND om.deleted_at IS NULL));

-- TIPS policies
DROP POLICY IF EXISTS "tips_select_org" ON tips;
CREATE POLICY "tips_select_org" ON tips FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = tips.organization_id AND om.user_id = auth.uid() AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "tips_insert" ON tips;
CREATE POLICY "tips_insert" ON tips FOR INSERT TO anon, authenticated WITH CHECK (true);

-- AUDIT_LOGS policies
DROP POLICY IF EXISTS "audit_select_org" ON audit_logs;
CREATE POLICY "audit_select_org" ON audit_logs FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = audit_logs.organization_id AND om.user_id = auth.uid() AND om.role IN ('admin','super_admin') AND om.deleted_at IS NULL));
DROP POLICY IF EXISTS "audit_insert" ON audit_logs;
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','organizations','organization_members','members','campaigns','donations','events','event_registrations','transactions','tips'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'phone',''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();