-- Part 1: Create all tables first (no policies yet)

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  platform_role text NOT NULL DEFAULT 'public' CHECK (platform_role IN ('super_admin', 'public')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  acronym text,
  slug text UNIQUE NOT NULL,
  description text,
  province text NOT NULL DEFAULT 'Brazzaville',
  city text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  cover_url text,
  legal_status text DEFAULT 'enregistree',
  registration_number text,
  domains text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'inactive')),
  is_verified boolean DEFAULT false,
  primary_color text DEFAULT '#0d7a4f',
  transparency_score integer DEFAULT 0,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. ORGANIZATION_MEMBERS
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member','volunteer','super_admin')),
  invited_by uuid REFERENCES auth.users(id),
  accepted_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 4. MEMBERS
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  birth_date date,
  gender text CHECK (gender IN ('M','F','other')),
  address text,
  city text,
  province text,
  membership_type text DEFAULT 'member' CHECK (membership_type IN ('member','volunteer','board','honorary')),
  membership_fee bigint DEFAULT 0,
  membership_status text DEFAULT 'active' CHECK (membership_status IN ('active','inactive','pending')),
  membership_start date DEFAULT CURRENT_DATE,
  membership_end date,
  card_number text,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  goal_amount bigint NOT NULL DEFAULT 0,
  current_amount bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  category text DEFAULT 'general',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','cancelled')),
  is_featured boolean DEFAULT false,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- 6. DONATIONS
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  donor_name text NOT NULL,
  donor_email text,
  donor_phone text,
  donor_is_anonymous boolean DEFAULT false,
  amount bigint NOT NULL,
  tip_amount bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  payment_provider text CHECK (payment_provider IN ('orange_money','mtn_momo','airtel_money','monetbil','cash','other')),
  receipt_number text,
  receipt_sent boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  location text NOT NULL,
  venue text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  capacity integer,
  registration_fee bigint DEFAULT 0,
  currency text NOT NULL DEFAULT 'XAF',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','cancelled','completed')),
  is_public boolean DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- 8. EVENT_REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_email text,
  participant_phone text,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','confirmed','checked_in','cancelled','no_show')),
  payment_status text DEFAULT 'free' CHECK (payment_status IN ('free','pending','paid','refunded')),
  checked_in_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donation_id uuid REFERENCES donations(id) ON DELETE SET NULL,
  event_registration_id uuid REFERENCES event_registrations(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('donation','tip','membership_fee','event_fee','refund','payout')),
  amount bigint NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  provider text CHECK (provider IN ('orange_money','mtn_momo','airtel_money','monetbil','cash','other')),
  provider_reference text,
  provider_transaction_id text,
  provider_phone text,
  description text,
  metadata jsonb DEFAULT '{}',
  processed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. TIPS
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  donation_id uuid REFERENCES donations(id) ON DELETE SET NULL,
  amount bigint NOT NULL,
  currency text NOT NULL DEFAULT 'XAF',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  tipper_name text,
  tipper_email text,
  created_at timestamptz DEFAULT now()
);

-- 11. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org_id ON members(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_donations_org_id ON donations(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_event_regs_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_ref ON transactions(provider_reference);
CREATE INDEX IF NOT EXISTS idx_tips_org_id ON tips(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);