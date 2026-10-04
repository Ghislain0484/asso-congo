-- ==============================================================================
-- AssoCongo - Script de création des comptes de démonstration et données de test
-- À exécuter dans le SQL Editor de Supabase
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. IDs fixes pour garantir la reproductibilité
DO $$
DECLARE
  uid_dgifn UUID := 'a1111111-1111-1111-1111-111111111111';
  uid_dev UUID   := 'b2222222-2222-2222-2222-222222222222';
  uid_asso UUID  := 'c3333333-3333-3333-3333-333333333333';
  uid_memb UUID  := 'd4444444-4444-4444-4444-444444444444';
  
  org_id UUID    := 'e5555555-5555-5555-5555-555555555555';
  camp1_id UUID  := 'f6666666-6666-6666-6666-666666666666';
  camp2_id UUID  := 'f7777777-7777-7777-7777-777777777777';
BEGIN

  -- 2. Création des utilisateurs dans auth.users
  -- Compte 1 : Régulateur DGIFN
  DELETE FROM auth.users WHERE email = 'dgifn.audit@finances.gouv.cg' OR id = uid_dgifn;
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    uid_dgifn,
    '00000000-0000-0000-0000-000000000000',
    'dgifn.audit@finances.gouv.cg',
    crypt('Demo2026!DGIFN', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"DGIFN - Contrôle et Régulation Financière","phone":"+242 06 600 00 01"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- Compte 2 : Développeur & Support Technique
  DELETE FROM auth.users WHERE email = 'dev.support@assocongo.cg' OR id = uid_dev;
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    uid_dev,
    '00000000-0000-0000-0000-000000000000',
    'dev.support@assocongo.cg',
    crypt('Demo2026!DEV', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Support Technique AssoCongo","phone":"+242 06 600 00 02"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- Compte 3 : Responsable d'Association (Admin ONG)
  DELETE FROM auth.users WHERE email = 'contact@espoircongo.cg' OR id = uid_asso;
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    uid_asso,
    '00000000-0000-0000-0000-000000000000',
    'contact@espoircongo.cg',
    crypt('Demo2026!ASSO', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Marien Ngouabi (Président Espoir Congo)","phone":"+242 06 600 00 03"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- Compte 4 : Adhérent / Bénévole de l'association
  DELETE FROM auth.users WHERE email = 'adherent@espoircongo.cg' OR id = uid_memb;
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
  ) VALUES (
    uid_memb,
    '00000000-0000-0000-0000-000000000000',
    'adherent@espoircongo.cg',
    crypt('Demo2026!MEMBER', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Grace Moukassa (Bénévole active)","phone":"+242 05 500 00 04"}'::jsonb,
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- 3. Mise à jour / création des profils
  INSERT INTO profiles (id, email, full_name, phone, platform_role)
  VALUES 
    (uid_dgifn, 'dgifn.audit@finances.gouv.cg', 'DGIFN - Contrôle et Régulation Financière', '+242 06 600 00 01', 'super_admin'),
    (uid_dev, 'dev.support@assocongo.cg', 'Support Technique AssoCongo', '+242 06 600 00 02', 'super_admin'),
    (uid_asso, 'contact@espoircongo.cg', 'Marien Ngouabi (Président Espoir Congo)', '+242 06 600 00 03', 'public'),
    (uid_memb, 'adherent@espoircongo.cg', 'Grace Moukassa (Bénévole active)', '+242 05 500 00 04', 'public')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    platform_role = EXCLUDED.platform_role;

  -- 4. Création de l'association de démonstration : Association Espoir Congo
  DELETE FROM organizations WHERE slug = 'espoir-congo' OR id = org_id;
  INSERT INTO organizations (
    id, name, acronym, slug, description, province, city, address,
    phone, email, legal_status, registration_number, domains,
    status, is_verified, primary_color, transparency_score
  ) VALUES (
    org_id,
    'Association Espoir Congo',
    'AEC',
    'espoir-congo',
    'Organisation non gouvernementale dédiée à l''éducation, la santé communautaire et l''autonomisation des jeunes à Brazzaville.',
    'Brazzaville',
    'Brazzaville',
    'Avenue de la Paix, Poto-Poto',
    '+242 06 600 00 03',
    'contact@espoircongo.cg',
    'enregistree',
    'REC-BZV-2024-N048',
    ARRAY['Éducation', 'Santé', 'Jeunesse'],
    'active',
    true,
    '#009543',
    95
  );

  -- 5. Attribution des rôles dans l'organisation
  DELETE FROM organization_members WHERE organization_id = org_id;
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES
    (org_id, uid_asso, 'admin'),
    (org_id, uid_memb, 'member'),
    (org_id, uid_dev, 'super_admin');

  -- 6. Création de campagnes de dons réalistes
  DELETE FROM campaigns WHERE organization_id = org_id;
  INSERT INTO campaigns (
    id, organization_id, title, slug, description, goal_amount, current_amount,
    currency, status, is_featured, end_date
  ) VALUES
  (
    camp1_id,
    org_id,
    'Rénovation de l''école primaire de Bacongo',
    'renovation-ecole-bacongo',
    'Projet d''équipement et de réhabilitation de 4 salles de classe pour 250 élèves du quartier Bacongo.',
    3000000,
    2150000,
    'XAF',
    'active',
    true,
    now() + interval '30 days'
  ),
  (
    camp2_id,
    org_id,
    'Kits scolaires et santé pour 200 enfants de Talangaï',
    'kits-scolaires-talangai',
    'Fourniture de fournitures scolaires, trousses de premiers secours et manuels.',
    1500000,
    1500000,
    'XAF',
    'completed',
    false,
    now() - interval '5 days'
  );

  -- 7. Événement de démonstration
  INSERT INTO events (
    organization_id, title, slug, description, location_name, location_address,
    city, start_date, end_date, is_free, price, currency, max_participants, status
  ) VALUES (
    org_id,
    'Journée de sensibilisation à l''hygiène et à l''eau potable',
    'journee-hygiene-eau-potable',
    'Conférence, ateliers pratiques et distribution de filtres à eau pour les familles.',
    'Maison Commune de Moungali',
    'Rond-Point Moungali',
    'Brazzaville',
    now() + interval '14 days',
    now() + interval '14 days 6 hours',
    true,
    0,
    'XAF',
    100,
    'active'
  );

  -- 8. Membres du CRM de l'ONG
  INSERT INTO members (
    organization_id, first_name, last_name, email, phone, membership_type,
    membership_fee, membership_status, card_number, city
  ) VALUES
    (org_id, 'Grace', 'Moukassa', 'adherent@espoircongo.cg', '+242 05 500 00 04', 'volunteer', 10000, 'active', 'CG-2026-00101', 'Brazzaville'),
    (org_id, 'Arsène', 'Loundou', 'arsene.loundou@gmail.com', '+242 06 612 34 56', 'member', 15000, 'active', 'CG-2026-00102', 'Brazzaville'),
    (org_id, 'Carine', 'Massamba', 'carine.massamba@yahoo.fr', '+242 04 423 45 67', 'board', 25000, 'active', 'CG-2026-00103', 'Pointe-Noire');

  -- 9. Transactions financières certifiées DGIFN (MTN MoMo & Airtel Money)
  DELETE FROM transactions WHERE organization_id = org_id;
  INSERT INTO transactions (
    organization_id, type, amount, currency, status,
    provider, provider_reference, description
  ) VALUES
    (org_id, 'donation', 50000, 'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-98124', 'Don pour l''école Bacongo via MTN MoMo (*105#)'),
    (org_id, 'donation', 25000, 'XAF', 'success', 'airtel_money', 'AIRTEL-CG-2026-44312', 'Don solidaire via Airtel Money (*128#)'),
    (org_id, 'donation', 100000, 'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-98441', 'Contribution entreprise mécène via MTN MoMo'),
    (org_id, 'membership_fee', 15000, 'XAF', 'success', 'airtel_money', 'AIRTEL-CG-2026-77810', 'Cotisation annuelle adhérent 2026'),
    (org_id, 'donation', 250000, 'XAF', 'success', 'cash', 'CASH-REC-BZV-01', 'Don en espèces déposé au siège avec reçu DGIFN');

  -- 10. Dons enregistrés dans la table donations
  INSERT INTO donations (
    organization_id, campaign_id, amount, currency, donor_name, donor_email,
    donor_phone, provider, status, receipt_number
  ) VALUES
    (org_id, camp1_id, 50000, 'XAF', 'Anonyme', 'anonyme@assocongo.cg', '+242 06 611 22 33', 'mtn_momo', 'completed', 'REC-2026-A109B'),
    (org_id, camp1_id, 25000, 'XAF', 'Christian Mabiala', 'donateur@gmail.com', '+242 06 644 55 66', 'airtel_money', 'completed', 'REC-2026-B448C');

END $$;
