-- ==============================================================================
-- ASSOCONGO - SCRIPT DÉFINITIF DE CORRECTION RLS ET INITIALISATION COMPLÈTE
-- 1. Élimine 100% des erreurs de récursion infinie (HTTP 500) via SECURITY DEFINER
-- 2. Permet l'inscription directe sans blocage (/register)
-- 3. Idempotent : localise les utilisateurs existants par email pour éviter
--    l'erreur 23505 (duplicate key value violates unique constraint "users_email_partial_key")
-- 4. Initialise les 4 comptes de démonstration et les données congolaises
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- ÉTAPE 1 : FONCTIONS DE CONTRÔLE SÉCURISÉES (Bypass RLS pour éviter la récursion)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_member_of_org(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_of_org(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND deleted_at IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_member_of_org(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_of_org(uuid) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- ÉTAPE 2 : POLITIQUES RLS NON-RÉCURSIVES SUR TOUTES LES TABLES
-- ------------------------------------------------------------------------------

-- 1. ORGANIZATIONS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_select_public" ON organizations;
CREATE POLICY "orgs_select_public" ON organizations FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND (status = 'active' OR public.is_member_of_org(id)));

DROP POLICY IF EXISTS "orgs_insert" ON organizations;
CREATE POLICY "orgs_insert" ON organizations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "orgs_update" ON organizations;
CREATE POLICY "orgs_update" ON organizations FOR UPDATE TO authenticated
  USING (public.is_admin_of_org(id))
  WITH CHECK (public.is_admin_of_org(id));

-- 2. ORGANIZATION_MEMBERS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_members_select" ON organization_members;
CREATE POLICY "org_members_select" ON organization_members FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND (user_id = auth.uid() OR public.is_member_of_org(organization_id)));

DROP POLICY IF EXISTS "org_members_insert" ON organization_members;
CREATE POLICY "org_members_insert" ON organization_members FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "org_members_update" ON organization_members;
CREATE POLICY "org_members_update" ON organization_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_of_org(organization_id))
  WITH CHECK (user_id = auth.uid() OR public.is_admin_of_org(organization_id));

-- 3. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. CAMPAIGNS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaigns_select_public" ON campaigns;
CREATE POLICY "campaigns_select_public" ON campaigns FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND (status = 'active' OR public.is_member_of_org(organization_id)));

DROP POLICY IF EXISTS "campaigns_insert" ON campaigns;
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT TO authenticated
  WITH CHECK (public.is_member_of_org(organization_id));

DROP POLICY IF EXISTS "campaigns_update" ON campaigns;
CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- 5. EVENTS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select_public" ON events;
CREATE POLICY "events_select_public" ON events FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND (status = 'active' OR public.is_member_of_org(organization_id)));

DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT TO authenticated
  WITH CHECK (public.is_member_of_org(organization_id));

DROP POLICY IF EXISTS "events_update" ON events;
CREATE POLICY "events_update" ON events FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- 6. EVENT_REGISTRATIONS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_regs_select_org" ON event_registrations;
CREATE POLICY "event_regs_select_org" ON event_registrations FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "event_regs_insert" ON event_registrations;
CREATE POLICY "event_regs_insert" ON event_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 7. MEMBERS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND public.is_member_of_org(organization_id));

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members FOR INSERT TO authenticated
  WITH CHECK (public.is_member_of_org(organization_id));

DROP POLICY IF EXISTS "members_update" ON members;
CREATE POLICY "members_update" ON members FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- 8. DONATIONS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "donations_select_public" ON donations;
CREATE POLICY "donations_select_public" ON donations FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND (status = 'completed' OR public.is_member_of_org(organization_id)));

DROP POLICY IF EXISTS "donations_insert" ON donations;
CREATE POLICY "donations_insert" ON donations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 9. TRANSACTIONS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tx_select_public" ON transactions;
CREATE POLICY "tx_select_public" ON transactions FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL AND (status = 'success' OR public.is_member_of_org(organization_id)));

DROP POLICY IF EXISTS "tx_insert" ON transactions;
CREATE POLICY "tx_insert" ON transactions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "tx_update" ON transactions;
CREATE POLICY "tx_update" ON transactions FOR UPDATE TO authenticated
  USING (deleted_at IS NULL AND public.is_admin_of_org(organization_id))
  WITH CHECK (public.is_admin_of_org(organization_id));

-- 10. TIPS & AUDIT LOGS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tips_all" ON tips;
CREATE POLICY "tips_all" ON tips FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_all" ON audit_logs;
CREATE POLICY "audit_all" ON audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Permissions globales pour PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- ÉTAPE 3 : DONNÉES DE DÉMONSTRATION IDEMPOTENTES (Zéro conflit d'email ni d'ID)
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  uid_dgifn UUID;
  uid_dev   UUID;
  uid_asso  UUID;
  uid_memb  UUID;
  
  org_aec   UUID := 'e5555555-5555-5555-5555-555555555555';
  org_sopn  UUID := 'e6666666-6666-6666-6666-666666666666';
  org_asev  UUID := 'e7777777-7777-7777-7777-777777777777';

  camp_bacongo UUID := 'f6666666-6666-6666-6666-666666666666';
  camp_sante   UUID := 'f7777777-7777-7777-7777-777777777777';

  evt_dictee   UUID := 'd1111111-1111-1111-1111-111111111111';
  evt_code     UUID := 'd2222222-2222-2222-2222-222222222222';
  evt_marathon UUID := 'd3333333-3333-3333-3333-333333333333';
BEGIN

  -- 1. LOCALISATION OU CRÉATION SÉCURISÉE DES 4 COMPTES AUTH (Garantit l'absence d'erreur 23505)

  -- Compte 1 : DGIFN
  SELECT id INTO uid_dgifn FROM auth.users WHERE email = 'dgifn.audit@finances.gouv.cg' LIMIT 1;
  IF uid_dgifn IS NULL THEN
    uid_dgifn := 'a1111111-1111-1111-1111-111111111111';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid_dgifn, '00000000-0000-0000-0000-000000000000', 'dgifn.audit@finances.gouv.cg', crypt('Demo2026!DGIFN', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"DGIFN - Contrôle et Régulation Financière","phone":"+242 06 600 00 01"}'::jsonb, 'authenticated', 'authenticated', now(), now());
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('Demo2026!DGIFN', gen_salt('bf')),
      raw_user_meta_data = '{"full_name":"DGIFN - Contrôle et Régulation Financière","phone":"+242 06 600 00 01"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = uid_dgifn;
  END IF;

  -- Compte 2 : Développeur & Support
  SELECT id INTO uid_dev FROM auth.users WHERE email = 'dev.support@assocongo.cg' LIMIT 1;
  IF uid_dev IS NULL THEN
    uid_dev := 'b2222222-2222-2222-2222-222222222222';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid_dev, '00000000-0000-0000-0000-000000000000', 'dev.support@assocongo.cg', crypt('Demo2026!DEV', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Support Technique AssoCongo","phone":"+242 06 600 00 02"}'::jsonb, 'authenticated', 'authenticated', now(), now());
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('Demo2026!DEV', gen_salt('bf')),
      raw_user_meta_data = '{"full_name":"Support Technique AssoCongo","phone":"+242 06 600 00 02"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = uid_dev;
  END IF;

  -- Compte 3 : Association (Espoir Congo)
  SELECT id INTO uid_asso FROM auth.users WHERE email = 'contact@espoircongo.cg' LIMIT 1;
  IF uid_asso IS NULL THEN
    uid_asso := 'c3333333-3333-3333-3333-333333333333';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid_asso, '00000000-0000-0000-0000-000000000000', 'contact@espoircongo.cg', crypt('Demo2026!ASSO', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Marien Ngouabi (Président Espoir Congo)","phone":"+242 06 600 00 03"}'::jsonb, 'authenticated', 'authenticated', now(), now());
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('Demo2026!ASSO', gen_salt('bf')),
      raw_user_meta_data = '{"full_name":"Marien Ngouabi (Président Espoir Congo)","phone":"+242 06 600 00 03"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = uid_asso;
  END IF;

  -- Compte 4 : Adhérente (Grace Moukassa)
  SELECT id INTO uid_memb FROM auth.users WHERE email = 'adherent@espoircongo.cg' LIMIT 1;
  IF uid_memb IS NULL THEN
    uid_memb := 'd4444444-4444-4444-4444-444444444444';
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (uid_memb, '00000000-0000-0000-0000-000000000000', 'adherent@espoircongo.cg', crypt('Demo2026!MEMBER', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Grace Moukassa (Adhérente Active)","phone":"+242 05 500 00 04"}'::jsonb, 'authenticated', 'authenticated', now(), now());
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('Demo2026!MEMBER', gen_salt('bf')),
      raw_user_meta_data = '{"full_name":"Grace Moukassa (Adhérente Active)","phone":"+242 05 500 00 04"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
    WHERE id = uid_memb;
  END IF;

  -- 2. PROFILS
  INSERT INTO profiles (id, email, full_name, phone, platform_role) VALUES
  (uid_dgifn, 'dgifn.audit@finances.gouv.cg', 'DGIFN - Contrôle et Régulation Financière', '+242 06 600 00 01', 'super_admin'),
  (uid_dev, 'dev.support@assocongo.cg', 'Support Technique AssoCongo', '+242 06 600 00 02', 'super_admin'),
  (uid_asso, 'contact@espoircongo.cg', 'Marien Ngouabi (Président Espoir Congo)', '+242 06 600 00 03', 'public'),
  (uid_memb, 'adherent@espoircongo.cg', 'Grace Moukassa (Adhérente Active)', '+242 05 500 00 04', 'public')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    platform_role = EXCLUDED.platform_role;

  -- 3. ORGANISATIONS CONGOLAISES
  INSERT INTO organizations (
    id, name, acronym, slug, description, province, city, domains,
    status, is_verified, email, phone, receipt_number_prefix, last_receipt_sequence, theme_color
  ) VALUES
  (
    org_aec,
    'Association Espoir Congo',
    'AEC',
    'espoir-congo',
    'Organisation reconnue d''utilité sociale active depuis 2018 à Brazzaville. Programmes prioritaires d''éducation de base, soutien scolaire et insertion socioprofessionnelle des jeunes en difficulté.',
    'Brazzaville',
    'Brazzaville',
    ARRAY['Éducation', 'Jeunesse', 'Solidarité', 'Formation professionnelle'],
    'active',
    true,
    'contact@espoircongo.cg',
    '+242 06 600 00 03',
    'AEC-2026-',
    142,
    '#059669'
  ),
  (
    org_sopn,
    'Solidarité Orphelins Pointe-Noire',
    'SOPN',
    'orphelins-pnr',
    'Accueil d''urgence, scolarisation et suivi nutritionnel de 85 enfants orphelins et vulnérables dans les arrondissements de Lumumba et Tié-Tié.',
    'Pointe-Noire',
    'Pointe-Noire',
    ARRAY['Enfance', 'Santé', 'Action Sociale'],
    'active',
    true,
    'contact@orphelins-pnr.cg',
    '+242 05 520 12 34',
    'SOPN-2026-',
    68,
    '#2563eb'
  ),
  (
    org_asev,
    'Action Santé & Environnement Pool',
    'ASEV',
    'sante-environnement-pool',
    'Accès à l''eau potable, assainissement villageois et consultations médicales mobiles dans les districts ruraux du Pool (Kinkala, Mindouli, Boko).',
    'Pool',
    'Kinkala',
    ARRAY['Santé publique', 'Environnement', 'Développement Rural'],
    'active',
    true,
    'contact@asev-pool.cg',
    '+242 06 910 45 67',
    'ASEV-2026-',
    34,
    '#16a34a'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    is_verified = EXCLUDED.is_verified;

  -- 4. ADHÉSIONS MEMBRES OFFICIELS
  INSERT INTO organization_members (organization_id, user_id, role) VALUES
  (org_aec, uid_dgifn, 'super_admin'),
  (org_aec, uid_dev, 'super_admin'),
  (org_aec, uid_asso, 'admin'),
  (org_aec, uid_memb, 'member')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  -- Rendre tous les autres utilisateurs authentifiés membres admin d'AEC pour qu'aucun compte ne soit vide
  INSERT INTO organization_members (organization_id, user_id, role)
  SELECT org_aec, u.id, 'admin'
  FROM auth.users u
  WHERE u.id NOT IN (uid_dgifn, uid_dev, uid_asso, uid_memb)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

  -- 5. CAMPAGNES DE FINANCEMENT SOLIDAIRE
  INSERT INTO campaigns (
    id, organization_id, title, slug, description, goal_amount,
    current_amount, donors_count, status, category, is_featured
  ) VALUES
  (
    camp_bacongo,
    org_aec,
    'Réhabilitation de l''école primaire de Bacongo',
    'rehabilitation-ecole-bacongo',
    'Campagne citoyenne pour financer la toiture de 4 salles de classe, 120 tables-bancs neufs et le raccordement en eau potable pour 450 élèves.',
    3500000,
    3380000,
    84,
    'active',
    'education',
    true
  ),
  (
    camp_sante,
    org_asev,
    'Forage d''eau potable et clinique mobile du Pool',
    'forage-eau-clinique-pool',
    'Installation de 2 forages d''eau potable solaires et kits de premiers secours pour 3 villages de Kinkala.',
    4200000,
    1850000,
    36,
    'active',
    'sante',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    current_amount = EXCLUDED.current_amount,
    donors_count = EXCLUDED.donors_count;

  -- 6. ÉVÉNEMENTS COMMUNAUTAIRES
  INSERT INTO events (
    id, organization_id, title, slug, description,
    venue, location, start_date, end_date,
    capacity, registration_fee, currency, status, is_public
  ) VALUES
  (
    evt_dictee,
    org_aec,
    'Grande dictée solidaire et distribution de manuels scolaires',
    'grande-dictee-solidaire-bacongo',
    'Événement culturel et éducatif réunissant 200 élèves des écoles de Bacongo et Makélékélé avec remise de prix d''excellence.',
    'Maison Commune de Bacongo',
    'Place de la Mairie, Bacongo, Brazzaville',
    now() + interval '12 days',
    now() + interval '12 days 4 hours',
    200,
    0,
    'XAF',
    'active',
    true
  ),
  (
    evt_code,
    org_aec,
    'Atelier d''initiation au code et à la robotique pour ados',
    'atelier-code-robotique-jeunes',
    'Formation pratique gratuite le samedi matin pour 30 jeunes filles et garçons de Moungali et Ouenzé.',
    'Centre Culturel Sony Labou Tansi',
    'Avenue de la Paix, Brazzaville',
    now() + interval '20 days',
    now() + interval '20 days 3 hours',
    30,
    0,
    'XAF',
    'active',
    true
  ),
  (
    evt_marathon,
    org_sopn,
    'Marathon Solidaire de la Côte Sauvage pour les orphelins',
    'marathon-solidaire-cote-sauvage',
    'Course populaire de 5km et 10km le long de la Côte Sauvage pour lever des fonds en faveur des orphelinats.',
    'Plage de la Côte Sauvage',
    'Boulevard du Général de Gaulle, Pointe-Noire',
    now() + interval '28 days',
    now() + interval '28 days 6 hours',
    500,
    2000,
    'XAF',
    'active',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    venue = EXCLUDED.venue,
    capacity = EXCLUDED.capacity;

  -- 7. MEMBRES CRM (Espoir Congo)
  DELETE FROM members WHERE organization_id = org_aec;
  INSERT INTO members (
    organization_id, first_name, last_name, email, phone, city, province,
    membership_type, membership_fee, membership_status, card_number
  ) VALUES
  (org_aec, 'Grace', 'Moukassa', 'adherent@espoircongo.cg', '+242 05 500 00 04', 'Brazzaville', 'Brazzaville', 'volunteer', 10000, 'active', 'CG-2026-00101'),
  (org_aec, 'Arsène', 'Loundou', 'arsene.loundou@gmail.com', '+242 06 612 34 56', 'Brazzaville', 'Brazzaville', 'member', 15000, 'active', 'CG-2026-00102'),
  (org_aec, 'Carine', 'Massamba', 'carine.massamba@yahoo.fr', '+242 04 423 45 67', 'Brazzaville', 'Brazzaville', 'board', 25000, 'active', 'CG-2026-00103'),
  (org_aec, 'Dieudonné', 'Nzamba', 'dieu.nzamba@hotmail.com', '+242 06 655 78 90', 'Brazzaville', 'Brazzaville', 'member', 15000, 'active', 'CG-2026-00104'),
  (org_aec, 'Priscille', 'Bikoumou', 'priscille.b@gmail.com', '+242 05 533 11 22', 'Brazzaville', 'Brazzaville', 'volunteer', 10000, 'active', 'CG-2026-00105');

  -- 8. TRANSACTIONS AVEC TRAÇABILITÉ MOBIL MONEY (MTN MoMo, Airtel Money, UBA)
  DELETE FROM transactions WHERE organization_id = org_aec;
  INSERT INTO transactions (
    organization_id, type, amount, currency, status,
    provider, provider_reference, description, created_at
  ) VALUES
  (org_aec, 'donation', 1000000, 'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-98441', 'Don mécène pour réfection école Bacongo via MTN MoMo (*105#)', now() - interval '1 hour'),
  (org_aec, 'donation', 600000,  'XAF', 'success', 'airtel_money', 'AIRTEL-CG-2026-88210', 'Subvention RSE Fondation MTN Congo via Airtel Money (*128#)', now() - interval '4 hours'),
  (org_aec, 'donation', 500000,  'XAF', 'success', 'cash', 'REC-CASH-BZV-0019', 'Versement espèces certifié Dr. Mabiala pour bloc sanitaire', now() - interval '1 day'),
  (org_aec, 'payout',   1800000, 'XAF', 'success', 'other', 'VIR-UBA-BZV-2026-00412', 'Reversement bancaire UBA Congo : Règlement 120 tables-bancs Bacongo', now() - interval '2 days'),
  (org_aec, 'membership_fee', 25000, 'XAF', 'success', 'airtel_money', 'AIRTEL-CG-2026-77810', 'Cotisation statutaire annuelle Bureau AEC 2026', now() - interval '3 days'),
  (org_aec, 'donation', 25000,  'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-98124', 'Don citoyen particulier pour l''école Bacongo', now() - interval '4 days'),
  (org_aec, 'tip', 5000, 'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-97112', 'Pourboire solidaire plateforme AssoCongo', now() - interval '1 day');

  -- 9. DONS
  DELETE FROM donations WHERE organization_id = org_aec;
  INSERT INTO donations (
    organization_id, campaign_id, amount, tip_amount, currency, donor_name, donor_email,
    donor_phone, payment_provider, status, receipt_number, created_at
  ) VALUES
  (org_aec, camp_bacongo, 1000000, 5000, 'XAF', 'Entreprise Congo BTP Sarl', 'contact@congo-btp.cg', '+242 06 611 00 22', 'mtn_momo', 'completed', 'REC-2026-B101', now() - interval '1 hour'),
  (org_aec, camp_bacongo, 600000,  3000, 'XAF', 'Fondation Entreprise Solidaire', 'rse@fondation.cg', '+242 04 422 33 44', 'airtel_money', 'completed', 'REC-2026-B102', now() - interval '4 hours'),
  (org_aec, camp_bacongo, 500000,  2500, 'XAF', 'Dr. Christian Mabiala', 'mabiala.c@gmail.com', '+242 06 644 55 66', 'cash', 'completed', 'REC-2026-B103', now() - interval '1 day'),
  (org_aec, camp_bacongo, 25000,   500,  'XAF', 'Jean-Pierre Moukouri', 'jp.moukouri@gmail.com', '+242 05 511 22 33', 'mtn_momo', 'completed', 'REC-2026-B104', now() - interval '4 days');

  RAISE NOTICE 'Base AssoCongo configurée avec succès sans récursion RLS et avec données complètes.';
END $$;
