-- ==============================================================================
-- ASSOCONGO - SCRIPT D'INJECTION DES DONNÉES DE DÉMONSTRATION "GRANDEUR NATURE"
-- République du Congo (Brazzaville) 🇨🇬
-- ==============================================================================
-- Version ultra-robuste avec suppression par ID + Slugs + ON CONFLICT
-- ==============================================================================

DO $$
DECLARE
  v_dgifn_user UUID;
  v_dev_user   UUID;
  v_asso_user  UUID;
  v_mbr_user   UUID;

  org_aec      UUID := 'e5555555-5555-5555-5555-555555555555';
  org_sopn     UUID := 'e6666666-6666-6666-6666-666666666666';
  org_asev     UUID := 'e7777777-7777-7777-7777-777777777777';

  cmp_bacongo  UUID := 'f6666666-6666-6666-6666-666666666666';
  cmp_filles   UUID := 'f7777777-7777-7777-7777-777777777777';
  cmp_talangai UUID := 'f8888888-8888-8888-8888-888888888888';
  cmp_pnr      UUID := 'f9999999-9999-9999-9999-999999999999';

  evt_dictee   UUID := 'd1111111-1111-1111-1111-111111111111';
  evt_code     UUID := 'd2222222-2222-2222-2222-222222222222';
  evt_marathon UUID := 'd3333333-3333-3333-3333-333333333333';

  don_1        UUID := 'c1111111-1111-1111-1111-111111111111';
  don_2        UUID := 'c2222222-2222-2222-2222-222222222222';
  don_3        UUID := 'c3333333-3333-3333-3333-333333333333';
  don_4        UUID := 'c4444444-4444-4444-4444-444444444444';
  don_5        UUID := 'c5555555-5555-5555-5555-555555555555';
BEGIN
  -- Récupérer les identifiants auth.users des comptes de démonstration
  SELECT id INTO v_dgifn_user FROM auth.users WHERE email = 'dgifn.audit@finances.gouv.cg';
  SELECT id INTO v_dev_user   FROM auth.users WHERE email = 'dev.support@assocongo.cg';
  SELECT id INTO v_asso_user  FROM auth.users WHERE email = 'contact@espoircongo.cg';
  SELECT id INTO v_mbr_user   FROM auth.users WHERE email = 'adherent@espoircongo.cg';

  -- 1. Mettre à jour les profils plateforme
  IF v_dgifn_user IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, phone, platform_role)
    VALUES (v_dgifn_user, 'dgifn.audit@finances.gouv.cg', 'Direction Générale des Institutions Financières Nationales', '+242 06 600 00 01', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET platform_role = 'super_admin', full_name = EXCLUDED.full_name;
  END IF;

  IF v_dev_user IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, phone, platform_role)
    VALUES (v_dev_user, 'dev.support@assocongo.cg', 'Support Technique AssoCongo', '+242 06 600 00 02', 'super_admin')
    ON CONFLICT (id) DO UPDATE SET platform_role = 'super_admin', full_name = EXCLUDED.full_name;
  END IF;

  IF v_asso_user IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, phone, platform_role)
    VALUES (v_asso_user, 'contact@espoircongo.cg', 'Marien Ngouabi (Président AEC)', '+242 06 600 00 03', 'public')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  END IF;

  IF v_mbr_user IS NOT NULL THEN
    INSERT INTO profiles (id, email, full_name, phone, platform_role)
    VALUES (v_mbr_user, 'adherent@espoircongo.cg', 'Grace Moukassa (Animatrice Bénévole)', '+242 05 500 00 04', 'public')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;
  END IF;

  -- 2. Nettoyage ordonné et complet par ID ET par SLUG (supprime toute trace antérieure)
  DELETE FROM transactions WHERE donation_id IN (don_1, don_2, don_3, don_4, don_5) OR organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM donations WHERE id IN (don_1, don_2, don_3, don_4, don_5) OR organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM event_registrations WHERE event_id IN (evt_dictee, evt_code, evt_marathon) OR organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM events WHERE id IN (evt_dictee, evt_code, evt_marathon) 
                     OR slug IN ('grande-dictee-solidaire-bacongo', 'atelier-code-robotique-jeunes', 'marathon-solidaire-cote-sauvage', 'depistage-gratuit-paludisme-kinkala') 
                     OR organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM campaigns WHERE id IN (cmp_bacongo, cmp_filles, cmp_talangai, cmp_pnr) 
                        OR slug IN ('renovation-ecole-bacongo', 'bourses-numeriques-filles', 'kits-scolaires-talangai', 'cantine-solidaire-tie-tie') 
                        OR organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM members WHERE card_number IN ('CG-2026-00101', 'CG-2026-00102', 'CG-2026-00103', 'CG-2026-00104', 'CG-2026-00105', 'CG-2026-00201') 
                     OR email IN ('adherent@espoircongo.cg', 'arsene.loundou@gmail.com', 'carine.massamba@yahoo.fr', 'dieu.nzamba@hotmail.com', 'priscille.b@gmail.com', 'jp.mabiala@gmail.com')
                     OR organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM organization_members WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM organizations WHERE id IN (org_aec, org_sopn, org_asev) 
                           OR slug IN ('espoir-congo', 'orphelins-pnr', 'sante-environnement-pool');

  -- 3. Insérer les Organisations congolaises
  INSERT INTO organizations (
    id, name, acronym, slug, description, province, city, address,
    phone, email, website, legal_status, registration_number, domains,
    status, is_verified, primary_color, transparency_score
  ) VALUES
  (
    org_aec,
    'Association Espoir Congo',
    'AEC',
    'espoir-congo',
    'Organisation non gouvernementale dédiée à l''éducation populaire, la santé communautaire et l''insertion des jeunes vulnérables à Brazzaville.',
    'Brazzaville',
    'Brazzaville',
    'Avenue de la Paix, Poto-Poto',
    '+242 06 600 00 03',
    'contact@espoircongo.cg',
    'https://assocongo.crossroadsgroupsarlu.com/o/espoir-congo',
    'enregistree',
    'REC-BZV-2024-N048',
    ARRAY['Éducation', 'Santé', 'Jeunesse'],
    'active',
    true,
    '#009543',
    96
  ),
  (
    org_sopn,
    'Solidarité Orphelins Pointe-Noire',
    'SOPN',
    'orphelins-pnr',
    'Prise en charge scolaire, nutritionnelle et médicale des orphelins et enfants en situation de rue dans le Kouilou.',
    'Pointe-Noire',
    'Pointe-Noire',
    'Boulevard Denis Sassou Nguesso, Rond-Point Lumumba',
    '+242 05 520 11 22',
    'direction@orphelins-pnr.cg',
    'https://assocongo.crossroadsgroupsarlu.com/o/orphelins-pnr',
    'enregistree',
    'REC-PNR-2023-A112',
    ARRAY['Enfance', 'Action humanitaire', 'Nutrition'],
    'active',
    true,
    '#FBDE4A',
    92
  ),
  (
    org_asev,
    'Action Santé & Environnement Villageois',
    'ASEV',
    'sante-environnement-pool',
    'Campagnes médicales itinérantes, accès à l''eau potable et reboisement communautaire dans le département du Pool.',
    'Pool',
    'Kinkala',
    'Place du Marché Central, Kinkala',
    '+242 06 630 44 55',
    'contact@asev-pool.cg',
    'https://assocongo.crossroadsgroupsarlu.com/o/sante-environnement-pool',
    'enregistree',
    'REC-POOL-2025-B007',
    ARRAY['Santé', 'Environnement', 'Développement local'],
    'active',
    true,
    '#009543',
    88
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    province = EXCLUDED.province,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    legal_status = EXCLUDED.legal_status,
    registration_number = EXCLUDED.registration_number,
    domains = EXCLUDED.domains,
    status = EXCLUDED.status,
    is_verified = EXCLUDED.is_verified,
    primary_color = EXCLUDED.primary_color,
    transparency_score = EXCLUDED.transparency_score;

  -- 4. Associer les utilisateurs démo aux membres de l'organisation AEC
  IF v_asso_user IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_aec, v_asso_user, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';
  END IF;

  IF v_dgifn_user IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_aec, v_dgifn_user, 'super_admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'super_admin';
  END IF;

  IF v_dev_user IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_aec, v_dev_user, 'super_admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'super_admin';
  END IF;

  IF v_mbr_user IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_aec, v_mbr_user, 'volunteer')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'volunteer';
  END IF;

  -- 5. Insérer les Campagnes (goal_amount en FCFA)
  INSERT INTO campaigns (
    id, organization_id, title, slug, description,
    goal_amount, current_amount, currency, category, status, is_featured,
    start_date, end_date
  ) VALUES
  (
    cmp_bacongo,
    org_aec,
    'Rénovation et équipement de l''école primaire de Bacongo',
    'renovation-ecole-bacongo',
    'Réhabilitation de 4 salles de classe dégradées, achat de 120 tables-bancs en bois local et installation de latrines écologiques pour 280 écoliers de Bacongo.',
    3000000,
    2150000,
    'XAF',
    'Éducation',
    'active',
    true,
    now() - interval '30 days',
    now() + interval '25 days'
  ),
  (
    cmp_filles,
    org_aec,
    'Bourses numériques pour 50 jeunes filles à Brazzaville',
    'bourses-numeriques-filles',
    'Financement de formations accélérées au développement web, bureautique et marketing digital à l''Université Marien Ngouabi.',
    1500000,
    1120000,
    'XAF',
    'Jeunesse',
    'active',
    false,
    now() - interval '20 days',
    now() + interval '40 days'
  ),
  (
    cmp_talangai,
    org_aec,
    'Kits scolaires et santé pour 200 enfants de Talangaï',
    'kits-scolaires-talangai',
    'Fourniture de manuels scolaires, cahiers, cartables et trousses de premiers soins pour la rentrée.',
    1500000,
    1500000,
    'XAF',
    'Éducation',
    'completed',
    true,
    now() - interval '60 days',
    now() - interval '5 days'
  ),
  (
    cmp_pnr,
    org_sopn,
    'Cantine solidaire et parrainage orphelins Tié-Tié',
    'cantine-solidaire-tie-tie',
    'Assurer 3 repas chauds par semaine à 120 orphelins vulnérables du quartier Tié-Tié à Pointe-Noire.',
    2000000,
    1350000,
    'XAF',
    'Enfance',
    'active',
    true,
    now() - interval '15 days',
    now() + interval '45 days'
  )
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    goal_amount = EXCLUDED.goal_amount,
    current_amount = EXCLUDED.current_amount,
    category = EXCLUDED.category,
    status = EXCLUDED.status;

  -- 6. Insérer les Événements (venue, location, capacity, registration_fee)
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
    organization_id = EXCLUDED.organization_id,
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    venue = EXCLUDED.venue,
    location = EXCLUDED.location,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    capacity = EXCLUDED.capacity,
    registration_fee = EXCLUDED.registration_fee,
    status = EXCLUDED.status;

  -- 7. Insérer les Membres du CRM
  INSERT INTO members (
    organization_id, first_name, last_name, email, phone,
    birth_date, gender, address, city, province,
    membership_type, membership_fee, membership_status, membership_start, membership_end,
    card_number, notes
  ) VALUES
  (
    org_aec, 'Grace', 'Moukassa', 'adherent@espoircongo.cg', '+242 05 500 00 04',
    '1995-04-12', 'F', 'Rue Mbaka, Bacongo', 'Brazzaville', 'Brazzaville',
    'volunteer', 10000, 'active', CURRENT_DATE - 60, CURRENT_DATE + 305,
    'CG-2026-00101', 'Animatrice pédagogique bénévole active'
  ),
  (
    org_aec, 'Arsène', 'Loundou', 'arsene.loundou@gmail.com', '+242 06 612 34 56',
    '1988-09-22', 'M', 'Boulevard Denis Sassou Nguesso', 'Brazzaville', 'Brazzaville',
    'member', 15000, 'active', CURRENT_DATE - 55, CURRENT_DATE + 310,
    'CG-2026-00102', 'Cotisation réglée via MTN MoMo (*105#)'
  ),
  (
    org_aec, 'Carine', 'Massamba', 'carine.massamba@yahoo.fr', '+242 04 423 45 67',
    '1984-02-18', 'F', 'Avenue de la Base', 'Brazzaville', 'Brazzaville',
    'board', 25000, 'active', CURRENT_DATE - 70, CURRENT_DATE + 295,
    'CG-2026-00103', 'Secrétaire générale adjointe'
  ),
  (
    org_aec, 'Dieudonné', 'Nzamba', 'dieu.nzamba@hotmail.com', '+242 06 655 78 90',
    '1992-11-05', 'M', 'Avenue des 3 Martyrs, Poto-Poto', 'Brazzaville', 'Brazzaville',
    'member', 15000, 'active', CURRENT_DATE - 40, CURRENT_DATE + 325,
    'CG-2026-00104', 'Adhérent actif'
  ),
  (
    org_aec, 'Priscille', 'Bikoumou', 'priscille.b@gmail.com', '+242 05 533 11 22',
    '1999-07-30', 'F', 'Quartier Moungali III', 'Brazzaville', 'Brazzaville',
    'volunteer', 10000, 'active', CURRENT_DATE - 25, CURRENT_DATE + 340,
    'CG-2026-00105', 'Chargée de communication réseaux sociaux'
  ),
  (
    org_sopn, 'Jean-Paul', 'Mabiala', 'jp.mabiala@gmail.com', '+242 05 567 89 01',
    '1975-03-14', 'M', 'Rond-Point Lumumba', 'Pointe-Noire', 'Pointe-Noire',
    'board', 30000, 'active', CURRENT_DATE - 90, CURRENT_DATE + 275,
    'CG-2026-00201', 'Trésorier SOPN'
  );

  -- 8. Insérer les Dons vérifiés (Total Projet Bacongo: 2 150 000 FCFA)
  INSERT INTO donations (
    id, organization_id, campaign_id, donor_name, donor_email, donor_phone,
    donor_is_anonymous, amount, tip_amount, currency, message, status,
    payment_provider, receipt_number, receipt_sent
  ) VALUES
  (
    don_1, org_aec, cmp_bacongo, 'Sylvain Batéké (Société BTP Congo)', 'sylvain.bateke@btp-congo.cg', '+242 06 611 00 22',
    false, 1000000, 15000, 'XAF', 'Notre entreprise soutient fièrement la réfection des salles de classe de Bacongo !', 'completed',
    'mtn_momo', 'REC-DGIFN-2026-004812', true
  ),
  (
    don_2, org_aec, cmp_bacongo, 'Dr. Christian Mabiala', 'mabiala.doc@cg-sante.org', '+242 06 612 00 99',
    false, 500000, 5000, 'XAF', 'Contribution pour le bloc sanitaire et les latrines écologiques.', 'completed',
    'cash', 'REC-DGIFN-2026-004813', true
  ),
  (
    don_3, org_aec, cmp_bacongo, 'M. & Mme Koumou (Diaspora France)', 'koumou.famille@orange.fr', '+33 6 12 34 56 78',
    false, 300000, 5000, 'XAF', 'Soutien de la diaspora congolaise de France pour la toiture en tôles bac.', 'completed',
    'airtel_money', 'REC-DGIFN-2026-004814', true
  ),
  (
    don_4, org_aec, cmp_bacongo, 'Patrick Mouyabi', 'patrick.mouyabi@gmail.com', '+242 06 644 55 66',
    false, 250000, 2500, 'XAF', 'Fidèle donateur pour l''éducation de nos enfants.', 'completed',
    'mtn_momo', 'REC-DGIFN-2026-004815', true
  ),
  (
    don_5, org_aec, cmp_bacongo, 'Donateur Anonyme Poto-Poto', NULL, '+242 06 644 55 66',
    true, 100000, 1000, 'XAF', 'Pour l''achat des tables-bancs en bois d''Iroko.', 'completed',
    'mtn_momo', 'REC-DGIFN-2026-004816', true
  )
  ON CONFLICT (id) DO UPDATE SET
    organization_id = EXCLUDED.organization_id,
    campaign_id = EXCLUDED.campaign_id,
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    payment_provider = EXCLUDED.payment_provider;

  -- 9. Insérer les Transactions réelles (avec traçabilité financière & reversement bancaire)
  INSERT INTO transactions (
    organization_id, donation_id, event_registration_id, type, amount, currency,
    status, provider, provider_reference, provider_transaction_id, provider_phone,
    description, processed_at
  ) VALUES
  (
    org_aec, NULL, NULL, 'payout', 1800000, 'XAF',
    'success', 'other', 'VIR-UBA-BZV-2026-00412', 'BANK-UBA-CG-00412', '+242 06 600 00 03',
    'Reversement bancaire certifié DGIFN vers compte UBA Congo AEC (N° CG023 00101 02000014820 45) - Règlement 120 tables-bancs', now() - interval '2 days'
  ),
  (
    org_aec, don_1, NULL, 'donation', 1000000, 'XAF',
    'success', 'mtn_momo', 'MOMO-CG-2026-98441', 'TXN-MTN-98441', '+242 06 611 00 22',
    'Don mécène pour réfection école primaire Bacongo via MTN MoMo (*105#)', now() - interval '15 days'
  ),
  (
    org_aec, don_2, NULL, 'donation', 500000, 'XAF',
    'success', 'cash', 'REC-CASH-BZV-0019', 'TXN-CSH-0019', '+242 06 612 00 99',
    'Don Dr. Mabiala pour réfection latrines avec reçu certifié DGIFN', now() - interval '10 days'
  ),
  (
    org_aec, don_3, NULL, 'donation', 300000, 'XAF',
    'success', 'airtel_money', 'AIRTEL-CG-2026-88210', 'TXN-ART-88210', '+33 6 12 34 56 78',
    'Don diaspora Koumou pour toiture Bacongo via Airtel Money (*128#)', now() - interval '6 days'
  ),
  (
    org_aec, don_4, NULL, 'donation', 250000, 'XAF',
    'success', 'mtn_momo', 'MOMO-CG-2026-97652', 'TXN-MTN-97652', '+242 06 644 55 66',
    'Don Patrick Mouyabi pour école Bacongo via MTN MoMo', now() - interval '4 days'
  ),
  (
    org_aec, don_5, NULL, 'donation', 100000, 'XAF',
    'success', 'mtn_momo', 'MOMO-CG-2026-98124', 'TXN-MTN-98124', '+242 06 644 55 66',
    'Don anonyme Poto-Poto pour école Bacongo via MTN MoMo', now() - interval '1 day'
  ),
  (
    org_aec, NULL, NULL, 'membership_fee', 25000, 'XAF',
    'success', 'airtel_money', 'AIRTEL-CG-2026-77810', 'TXN-ART-77810', '+242 04 423 45 67',
    'Cotisation annuelle 2026 - Secrétaire Générale (Carine Massamba)', now() - interval '25 days'
  ),
  (
    org_aec, NULL, NULL, 'membership_fee', 15000, 'XAF',
    'success', 'mtn_momo', 'MOMO-CG-2026-96101', 'TXN-MTN-96101', '+242 06 612 34 56',
    'Adhésion annuelle membre actif 2026 (Arsène Loundou)', now() - interval '20 days'
  ),
  (
    org_aec, NULL, NULL, 'tip', 15000, 'XAF',
    'success', 'mtn_momo', 'MOMO-CG-2026-TIP01', 'TXN-TIP-01', '+242 06 611 00 22',
    'Pourboire de fonctionnement AssoCongo', now() - interval '15 days'
  ),
  (
    org_sopn, NULL, NULL, 'donation', 75000, 'XAF',
    'success', 'airtel_money', 'AIRTEL-CG-2026-91144', 'TXN-ART-91144', '+242 05 520 11 22',
    'Don cantine Tié-Tié Pointe-Noire via Airtel Money (*128#)', now() - interval '2 days'
  );

END $$;

-- 10. POLITIQUES RLS ÉTENDUES POUR SUPER_ADMIN (DGIFN & DÉVELOPPEURS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.platform_role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "orgs_select_super_admin" ON organizations;
CREATE POLICY "orgs_select_super_admin" ON organizations FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "campaigns_select_super_admin" ON campaigns;
CREATE POLICY "campaigns_select_super_admin" ON campaigns FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "members_select_super_admin" ON members;
CREATE POLICY "members_select_super_admin" ON members FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "events_select_super_admin" ON events;
CREATE POLICY "events_select_super_admin" ON events FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "tx_select_super_admin" ON transactions;
CREATE POLICY "tx_select_super_admin" ON transactions FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "donations_select_super_admin" ON donations;
CREATE POLICY "donations_select_super_admin" ON donations FOR SELECT TO authenticated
  USING (public.is_super_admin());
