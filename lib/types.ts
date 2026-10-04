// Database types for AssoCongo

export type PlatformRole = 'super_admin' | 'public';
export type OrgRole = 'admin' | 'member' | 'volunteer' | 'super_admin';
export type OrgStatus = 'active' | 'pending' | 'suspended' | 'inactive';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type EventStatus = 'draft' | 'active' | 'cancelled' | 'completed';
export type RegistrationStatus = 'registered' | 'confirmed' | 'checked_in' | 'cancelled' | 'no_show';
export type PaymentStatus = 'free' | 'pending' | 'paid' | 'refunded';
export type TransactionType = 'donation' | 'tip' | 'membership_fee' | 'event_fee' | 'refund' | 'payout';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentProvider = 'orange_money' | 'mtn_momo' | 'airtel_money' | 'monetbil' | 'cash' | 'other';
export type MembershipType = 'member' | 'volunteer' | 'board' | 'honorary';
export type MembershipStatus = 'active' | 'inactive' | 'pending';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  platform_role: PlatformRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  acronym: string | null;
  slug: string;
  description: string | null;
  province: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  cover_url: string | null;
  legal_status: string;
  registration_number: string | null;
  domains: string[];
  status: OrgStatus;
  is_verified: boolean;
  primary_color: string;
  transparency_score: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  accepted_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: 'M' | 'F' | 'other' | null;
  address: string | null;
  city: string | null;
  province: string | null;
  membership_type: MembershipType;
  membership_fee: number;
  membership_status: MembershipStatus;
  membership_start: string | null;
  membership_end: string | null;
  card_number: string | null;
  notes: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  goal_amount: number;
  current_amount: number;
  currency: string;
  category: string;
  status: CampaignStatus;
  is_featured: boolean;
  start_date: string;
  end_date: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string | null;
  donor_is_anonymous: boolean;
  amount: number;
  tip_amount: number;
  currency: string;
  message: string | null;
  status: DonationStatus;
  payment_provider: PaymentProvider | null;
  receipt_number: string | null;
  receipt_sent: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  location: string;
  venue: string | null;
  start_date: string;
  end_date: string | null;
  capacity: number | null;
  registration_fee: number;
  currency: string;
  status: EventStatus;
  is_public: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  organization_id: string;
  participant_name: string;
  participant_email: string | null;
  participant_phone: string | null;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  checked_in_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  donation_id: string | null;
  event_registration_id: string | null;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  provider: PaymentProvider | null;
  provider_reference: string | null;
  provider_transaction_id: string | null;
  provider_phone: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  processed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tip {
  id: string;
  organization_id: string;
  donation_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  tipper_name: string | null;
  tipper_email: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
