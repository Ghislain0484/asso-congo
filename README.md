# AssoCongo

**La plateforme 100% gratuite de gestion des ONG en Republique du Congo**

AssoCongo est une plateforme web inspiree du modele HelloAsso, specialement concue pour les ONG et associations congolaises. Elle s'aligne explicitement avec les missions de la Direction Generale des Institutions Financieres Nationales (DGIFN) : modernisation des paiements, inclusion financiere, et tracabilite des flux.

## Fonctionnalites

- **Gestion d'ONG** : Creation de compte, profil personnalisable, page publique avec QR code
- **CRM des membres** : Fichier centralise, cotisations, cartes de membre numeriques, import/export CSV
- **Campagnes de dons** : Crowdfunding, formulaires publics, pourboires volontaires (modele HelloAsso)
- **Evenements & billetterie** : Creation d'evenements, inscriptions en ligne, check-in
- **Tableau de bord** : Vue financiere claire, historique des transactions, exports CSV
- **Transparence DGIFN** : Journal d'audit, tracabilite complete, reus automatiques, indicateurs de transparence
- **Paiements Mobile Money** : Orange Money, MTN MoMo, Airtel Money, Monetbil (architecture mock prete pour integration reelle)

## Stack technique

- **Frontend** : Next.js 13 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Next.js Server Components + Supabase
- **Base de donnees** : Supabase (PostgreSQL + Auth + RLS)
- **Paiements** : Architecture abstraite avec mock pour operateurs Mobile Money congolais

## Structure du projet

```
app/
  layout.tsx              # Layout racine avec AuthProvider
  page.tsx                # Page d'accueil publique
  login/                  # Page de connexion
  register/               # Inscription + creation d'ONG (2 etapes)
  dashboard/              # Espace de gestion ONG (protege)
    layout.tsx            # Sidebar + navigation
    page.tsx              # Vue d'ensemble (stats, campagnes, evenements)
    membres/              # CRM des membres
    campagnes/            # Gestion des campagnes
    campagnes/[id]/       # Detail d'une campagne
    evenements/           # Gestion des evenements
    evenements/[id]/      # Detail d'un evenement
    transactions/         # Journal des transactions + transparence
    parametres/           # Parametres de l'ONG
  o/[slug]/               # Page publique d'une ONG
    don/                  # Formulaire de don avec Mobile Money
    campagnes/[campslug]/ # Detail public d'une campagne
    evenements/[eventslug]/ # Detail public d'un evenement
  associations/           # Liste publique des ONG
  campagnes/              # Liste publique des campagnes
  evenements/             # Liste publique des evenements
  transparence/           # Page de transparence de la plateforme
  a-propos/               # Page a propos
lib/
  types.ts                # Types TypeScript pour toute la DB
  constants.ts            # Constantes, formatage, labels
  payment.ts              # Abstraction des providers de paiement
  supabase-client.ts      # Client Supabase (cote client)
  supabase-server.ts      # Client Supabase (cote serveur)
  auth-context.tsx        # Contexte d'authentification React
```

## Base de donnees

11 tables avec RLS (Row Level Security) activee :

1. **profiles** - Profils utilisateurs (extension de auth.users)
2. **organizations** - ONG/associations (tenant principal)
3. **organization_members** - Liaison users <-> organizations avec roles
4. **members** - Membres/adherents d'une ONG (CRM)
5. **campaigns** - Campagnes de dons
6. **donations** - Dons avec statut, provider, recu
7. **events** - Evenements
8. **event_registrations** - Inscriptions aux evenements
9. **transactions** - Journal financier detaille (tracon DGIFN)
10. **tips** - Pourboires volontaires
11. **audit_logs** - Journal d'audit

### Rôles

- **super_admin** : Administrateur de la plateforme
- **admin** : Administrateur d'une ONG
- **member** : Membre d'une ONG
- **volunteer** : Benevole d'une ONG

### Securite

- Multi-tenant strict : isolation des donnees par `organization_id`
- RLS sur toutes les tables avec politiques par role
- Soft delete via `deleted_at` sur toutes les tables
- Triggers `updated_at` automatiques
- Creation automatique de profil a l'inscription

## Architecture de paiement

La couche de paiement est abstraite dans `lib/payment.ts`. Chaque transaction enregistre :
- Montant et devise
- Provider (Orange Money, MTN, Airtel, Monetbil, Especes)
- Reference operateur et ID de transaction
- Numero de telephone du payeur
- Statut et horodatage

L'implementation actuelle est un **mock** qui simule le flux Mobile Money. Pour une integration reelle, remplacer la fonction `processPayment` par les appels API des operateurs.

## Donnees de demonstration

3 ONG fictives sont pre-chargeees :
1. **Association Espoir Congo** (Kinkala, Pool) - Education, eau, humanitaire
2. **ONG Sante Pour Tous** (Pointe-Noire) - Sante, humanitaire, jeunesse
3. **Congo Vert Environnement** (Ouesso, Sangha) - Environnement, plaidoyer

Avec des campagnes, evenements, dons et membres de demonstration.

## Demarrage

Le projet est preconfigure avec Supabase. Les variables d'environnement sont deja definies.

```bash
npm install
npm run dev
```

## Alignement DGIFN

AssoCongo s'inscrit dans les missions de la DGIFN :
- Modernisation et securisation des moyens de paiement
- Developpement des services financiers numeriques
- Promotion de l'inclusion financiere
- Tracabilite et transparence des flux financiers

L'architecture est prete pour une future conformite reglementaire (COBAC).
