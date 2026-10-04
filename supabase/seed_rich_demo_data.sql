-- ==============================================================================
-- AssoCongo - Données de démonstration réalistes & immersives pour le Congo
-- À exécuter dans le SQL Editor de Supabase
-- ==============================================================================

DO $$
DECLARE
  -- Organisations UUIDs
  org_aec UUID   := 'e5555555-5555-5555-5555-555555555555'; -- Espoir Congo (Brazzaville)
  org_fbcv UUID  := 'e1111111-1111-1111-1111-111111111111'; -- Bassin du Congo Vert (Sangha / Likouala)
  org_sopn UUID  := 'e2222222-2222-2222-2222-222222222222'; -- Solidarité Océan (Pointe-Noire)
  org_asev UUID  := 'e3333333-3333-3333-3333-333333333333'; -- Action Santé & Eau (Pool / Bouenza)
  org_vfe UUID   := 'e4444444-4444-4444-4444-444444444444'; -- Voix des Femmes (Niari - Dolisie)

  -- Campagnes UUIDs
  camp_aec1 UUID := 'f6666666-6666-6666-6666-666666666666';
  camp_aec2 UUID := 'f7777777-7777-7777-7777-777777777777';
  camp_fbcv UUID := 'f1111111-1111-1111-1111-111111111111';
  camp_sopn UUID := 'f2222222-2222-2222-2222-222222222222';
  camp_asev UUID := 'f3333333-3333-3333-3333-333333333333';
  camp_vfe  UUID := 'f4444444-4444-4444-4444-444444444444';

  -- Événements UUIDs
  evt_aec UUID  := 'd1111111-1111-1111-1111-111111111111';
  evt_sopn UUID := 'd2222222-2222-2222-2222-222222222222';
  evt_asev UUID := 'd3333333-3333-3333-3333-333333333333';

  -- ID de l'utilisateur démo association
  v_asso_user UUID;
BEGIN
  -- Récupérer l'utilisateur contact@espoircongo.cg s'il existe
  SELECT id INTO v_asso_user FROM auth.users WHERE email = 'contact@espoircongo.cg';

  -- Nettoyage préalable des organisations démo pour garantir des IDs exacts
  DELETE FROM organizations WHERE slug IN (
    'espoir-congo',
    'bassin-du-congo-vert',
    'solidarite-ocean-pointe-noire',
    'action-sante-eau-vivante',
    'voix-des-femmes-congo'
  );

  -- 1. INSERTION DES 5 ORGANISATIONS CONGOLAISES
  INSERT INTO organizations (
    id, name, acronym, slug, description, province, city, address, phone, email,
    legal_status, registration_number, domains, status, is_verified, primary_color, transparency_score
  ) VALUES
  (
    org_aec,
    'Association Espoir Congo',
    'AEC',
    'espoir-congo',
    'Organisation non gouvernementale dédiée à l''éducation populaire, la santé communautaire et l''inclusion des jeunes vulnérables.',
    'Brazzaville', 'Brazzaville', 'Avenue de la Paix, Poto-Poto', '+242 06 600 00 03', 'contact@espoircongo.cg',
    'enregistree', 'REC-BZV-2024-N048', ARRAY['Éducation', 'Santé', 'Jeunesse'], 'active', true, '#009543', 96
  ),
  (
    org_fbcv,
    'Fondation Bassin du Congo Vert',
    'FBCV',
    'bassin-du-congo-vert',
    'Protection de la biodiversité du Bassin du Congo, préservation des tourbières de la Likouala et appui aux communautés forestières autochtones.',
    'Sangha', 'Ouesso', 'Quartier Mbindjo', '+242 06 512 88 99', 'contact@congovert.ong.cg',
    'enregistree', 'REC-OUES-2023-ENV01', ARRAY['Environnement', 'Développement rural', 'Recherche'], 'active', true, '#009543', 98
  ),
  (
    org_sopn,
    'Solidarité Océan Pointe-Noire',
    'SOPN',
    'solidarite-ocean-pointe-noire',
    'Prise en charge d''orphelins, lutte contre la précarité urbaine et insertion socioprofessionnelle des jeunes dans les quartiers périphériques.',
    'Pointe-Noire', 'Pointe-Noire', 'Avenue Moe Pratt, Tié-Tié', '+242 05 677 12 34', 'info@solidarite-ocean.cg',
    'enregistree', 'REC-PNR-2022-SOC09', ARRAY['Aide humanitaire', 'Jeunesse', 'Droits humains'], 'active', true, '#FBDE4A', 92
  ),
  (
    org_asev,
    'Action Santé & Eau Vivante',
    'ASEV',
    'action-sante-eau-vivante',
    'Accès à l''eau potable par forages solaires et dispensaires mobiles dans les zones rurales enclavées du Pool et de la Bouenza.',
    'Pool', 'Kinkala', 'Centre Urbain Kinkala', '+242 06 820 45 67', 'contact@asev-congo.org',
    'enregistree', 'REC-POOL-2023-SAN03', ARRAY['Eau et assainissement', 'Santé', 'Développement rural'], 'active', true, '#009543', 95
  ),
  (
    org_vfe,
    'Voix des Femmes & Énergie Rurale',
    'VFE-Congo',
    'voix-des-femmes-congo',
    'Autonomisation financière des femmes maraîchères du Niari via des coopératives solaires et des micro-crédits rotatifs.',
    'Niari', 'Dolisie', 'Quartier Gaïa', '+242 04 430 90 12', 'vfe.dolisie@gmail.com',
    'enregistree', 'REC-DOL-2024-FEM12', ARRAY['Femmes et genre', 'Microfinance', 'Sécurité alimentaire'], 'active', true, '#DC241F', 94
  );

  -- Lier l'utilisateur démo à Espoir Congo
  IF v_asso_user IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_aec, v_asso_user, 'admin')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END IF;

  -- 2. INSERTION DES CAMPAGNES DE DONS
  INSERT INTO campaigns (
    id, organization_id, title, slug, description, goal_amount, current_amount,
    currency, category, status, is_featured, end_date
  ) VALUES
  (
    camp_aec1,
    org_aec,
    'Rénovation et équipement de l''école primaire de Bacongo',
    'renovation-ecole-bacongo',
    'Réhabilitation de 4 salles de classe dégradées, achat de 120 tables-bancs et installation de latrines écologiques pour 280 écoliers de Bacongo.',
    3000000, 2450000, 'XAF', 'Éducation', 'active', true, now() + interval '25 days'
  ),
  (
    camp_aec2,
    org_aec,
    'Bourses numériques pour 50 jeunes filles à Brazzaville',
    'bourses-numeriques-filles',
    'Financement de formations accélérées au développement web, bureautique et marketing digital à l''Université Marien Ngouabi.',
    1500000, 1120000, 'XAF', 'Jeunesse', 'active', false, now() + interval '40 days'
  ),
  (
    camp_fbcv,
    org_fbcv,
    'Sauvegarde des tourbières et forêts du Nord-Congo',
    'sauvegarde-tourbieres-nord-congo',
    'Financement d''équipements GPS et solaires pour 30 éco-gardes locaux surveillant les puits de carbone vitaux de la Likouala et de la Sangha.',
    10000000, 7850000, 'XAF', 'Environnement', 'active', true, now() + interval '60 days'
  ),
  (
    camp_sopn,
    org_sopn,
    'Cantine solidaire annuelle de l''Orphelinat de Tié-Tié',
    'cantine-orphelinat-tie-tie',
    'Garantir 3 repas équilibrés quotidiens et le suivi médical de 65 orphelins pendant toute l''année scolaire 2026 à Pointe-Noire.',
    2500000, 2500000, 'XAF', 'Aide humanitaire', 'completed', true, now() - interval '2 days'
  ),
  (
    camp_asev,
    org_asev,
    'Forages solaires d''eau potable dans 5 villages du Pool',
    'forages-solaires-pool',
    'Éradication des maladies hydriques en installant des pompes solaires à débit continu à Kinkala et Boko.',
    5000000, 3900000, 'XAF', 'Eau et assainissement', 'active', true, now() + interval '35 days'
  ),
  (
    camp_vfe,
    org_vfe,
    'Fonds de micro-crédits pour les coopératives maraîchères de Dolisie',
    'fonds-micro-credits-dolisie',
    'Dotation en semences améliorées, motopompes et fonds de roulement pour 120 femmes agricultrices du Niari.',
    4000000, 3200000, 'XAF', 'Femmes et genre', 'active', false, now() + interval '45 days'
  )
  ON CONFLICT (organization_id, slug) DO UPDATE SET
    current_amount = EXCLUDED.current_amount,
    goal_amount = EXCLUDED.goal_amount,
    status = EXCLUDED.status;

  -- 3. INSERTION D''ÉVÉNEMENTS COMMUNAUTAIRES
  INSERT INTO events (
    id, organization_id, title, slug, description, venue, location,
    start_date, end_date, capacity, registration_fee, currency, status, is_public
  ) VALUES
  (
    evt_aec,
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
    evt_sopn,
    org_sopn,
    'Marathon Solidaire de la Côte Sauvage pour les orphelins',
    'marathon-solidaire-cote-sauvage',
    'Course populaire de 5km et 10km le long de la Côte Sauvage pour lever des fonds en faveur des structures d''accueil de l''enfance.',
    'Plage de la Côte Sauvage',
    'Boulevard du Général de Gaulle, Pointe-Noire',
    now() + interval '20 days',
    now() + interval '20 days 6 hours',
    500,
    2000,
    'XAF',
    'active',
    true
  ),
  (
    evt_asev,
    org_asev,
    'Journée de dépistage gratuit du paludisme et distribution de moustiquaires',
    'depistage-gratuit-paludisme-kinkala',
    'Consultations médicales ouvertes à tous les habitants du district de Kinkala avec remise de moustiquaires imprégnées.',
    'Place du Marché Central',
    'Avenue Principale, Kinkala, Pool',
    now() + interval '18 days',
    now() + interval '18 days 8 hours',
    350,
    0,
    'XAF',
    'active',
    true
  )
  ON CONFLICT (organization_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    start_date = EXCLUDED.start_date;

  -- 4. INSERTION DE MEMBRES ET BÉNÉVOLES DANS LE CRM (Espoir Congo)
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

  -- 5. INSERTION DE TRANSACTIONS MOBIL MONEY AVEC TRAÇABILITÉ DGIFN
  DELETE FROM transactions WHERE organization_id = org_aec;
  INSERT INTO transactions (
    organization_id, type, amount, currency, status,
    provider, provider_reference, description, created_at
  ) VALUES
  (org_aec, 'donation', 100000, 'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-98441', 'Don mécène pour l''école Bacongo via MTN MoMo (*105#)', now() - interval '1 hour'),
  (org_aec, 'donation', 50000,  'XAF', 'success', 'airtel_money', 'AIRTEL-CG-2026-88210', 'Don anonyme pour bourses numériques via Airtel Money (*128#)', now() - interval '4 hours'),
  (org_aec, 'donation', 25000,  'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-98124', 'Don particulier école Bacongo via MTN MoMo', now() - interval '1 day'),
  (org_aec, 'membership_fee', 25000, 'XAF', 'success', 'airtel_money', 'AIRTEL-CG-2026-77810', 'Cotisation annuelle Bureau AEC 2026', now() - interval '2 days'),
  (org_aec, 'donation', 15000,  'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-97652', 'Don solidaire jeune diplômé via MTN MoMo', now() - interval '3 days'),
  (org_aec, 'donation', 250000, 'XAF', 'success', 'cash', 'CASH-REC-BZV-01', 'Don numéraire reçu au siège avec reçu officiel DGIFN', now() - interval '4 days'),
  (org_aec, 'tip', 2000, 'XAF', 'success', 'mtn_momo', 'MOMO-CG-2026-97112', 'Pourboire solidaire plateforme AssoCongo', now() - interval '1 day');

  -- 6. INSERTION DANS LA TABLE DONATIONS (pour les statistiques publiques)
  DELETE FROM donations WHERE organization_id = org_aec;
  INSERT INTO donations (
    organization_id, campaign_id, amount, tip_amount, currency, donor_name, donor_email,
    donor_phone, payment_provider, status, receipt_number, created_at
  ) VALUES
  (org_aec, camp_aec1, 100000, 2000, 'XAF', 'Entreprise Congo BTP', 'contact@congo-btp.cg', '+242 06 611 00 22', 'mtn_momo', 'completed', 'REC-2026-B101', now() - interval '1 hour'),
  (org_aec, camp_aec2, 50000, 1000, 'XAF', 'Anonyme', 'anonyme@assocongo.cg', '+242 04 422 33 44', 'airtel_money', 'completed', 'REC-2026-B102', now() - interval '4 hours'),
  (org_aec, camp_aec1, 25000, 500,  'XAF', 'Christian Mabiala', 'mabiala.c@gmail.com', '+242 06 644 55 66', 'mtn_momo', 'completed', 'REC-2026-B103', now() - interval '1 day'),
  (org_aec, camp_aec1, 15000, 500,  'XAF', 'Awa Samba', 'awa.samba@gmail.com', '+242 05 511 22 33', 'mtn_momo', 'completed', 'REC-2026-B104', now() - interval '3 days');

  -- 7. INSERTION DE POURBOIRES VOLONTAIRES (HelloAsso model)
  INSERT INTO tips (organization_id, amount, currency, status, tipper_name, tipper_email)
  VALUES
  (org_aec, 2000, 'XAF', 'completed', 'Entreprise Congo BTP', 'contact@congo-btp.cg'),
  (org_aec, 1000, 'XAF', 'completed', 'Donateur Anonyme', 'anonyme@assocongo.cg'),
  (org_aec, 500,  'XAF', 'completed', 'Christian Mabiala', 'mabiala.c@gmail.com'),
  (org_aec, 500,  'XAF', 'completed', 'Awa Samba', 'awa.samba@gmail.com');

END $$;
