-- ==============================================================================
-- ASSOCONGO - SCRIPT POUR VIDER LES DONNÉES DE DÉMONSTRATION
-- À utiliser au moment opportun lorsque vous souhaitez repartir d'une base vierge
-- ==============================================================================

DO $$
DECLARE
  org_aec      UUID := 'e5555555-5555-5555-5555-555555555555';
  org_sopn     UUID := 'e6666666-6666-6666-6666-666666666666';
  org_asev     UUID := 'e7777777-7777-7777-7777-777777777777';
BEGIN
  -- Suppression ordonnée des données associées aux démos
  DELETE FROM audit_logs WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM tips WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM transactions WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM donations WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM event_registrations WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM events WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM campaigns WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM members WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM organization_members WHERE organization_id IN (org_aec, org_sopn, org_asev);
  DELETE FROM organizations WHERE id IN (org_aec, org_sopn, org_asev) OR slug IN ('espoir-congo', 'orphelins-pnr', 'sante-environnement-pool');

  RAISE NOTICE 'Les données de démonstration ont été purgées avec succès.';
END $$;
