// App-wide constants for AssoCongo

// Départements officiels de la République du Congo (Brazzaville)
export const DEPARTEMENTS_CONGO = [
  'Brazzaville',
  'Pointe-Noire',
  'Bouenza',
  'Cuvette',
  'Cuvette-Ouest',
  'Kouilou',
  'Lékoumou',
  'Likouala',
  'Niari',
  'Plateaux',
  'Pool',
  'Sangha',
] as const;

// Alias pour compatibilité
export const PROVINCES_CONGO = DEPARTEMENTS_CONGO;

export const DOMAINS_INTERVENTION = [
  'Éducation',
  'Santé',
  'Environnement',
  'Droits humains',
  'Aide humanitaire',
  'Développement rural',
  'Microfinance',
  'Jeunesse',
  'Femmes et genre',
  'Culture',
  'Sport',
  'Recherche',
  'Plaidoyer',
  'Eau et assainissement',
  'Sécurité alimentaire',
] as const;

export const APP_NAME = 'AssoCongo';
export const APP_TAGLINE = 'La plateforme gratuite de gestion des ONG au Congo';
export const APP_DESCRIPTION =
  'AssoCongo est une plateforme 100% gratuite de gestion d\'ONG et d\'associations en République du Congo, alignée avec les missions de la DGIFN pour la transparence et l\'inclusion financière.';

export const CURRENCY = 'XAF';
export const CURRENCY_LABEL = 'FCFA';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithSymbol(amount: number): string {
  return `${formatCurrency(amount)} ${CURRENCY_LABEL}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 30) return `il y a ${diffD}j`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REC-${year}-${random}`;
}

export function generateMemberCardNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `CG-${year}-${random}`;
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  suspended: 'Suspendu',
  inactive: 'Inactif',
  draft: 'Brouillon',
  paused: 'En pause',
  completed: 'Terminé',
  cancelled: 'Annulé',
  failed: 'Échoué',
  refunded: 'Remboursé',
  registered: 'Inscrit',
  confirmed: 'Confirmé',
  checked_in: 'Présent',
  no_show: 'Absent',
  free: 'Gratuit',
  paid: 'Payé',
  success: 'Réussi',
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  member: 'Membre',
  volunteer: 'Bénévole',
  public: 'Public',
};

export const PROVIDER_LABELS: Record<string, string> = {
  mtn_momo: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
  monetbil: 'Monetbil',
  cash: 'Espèces',
  orange_money: 'Orange Money (Inactif)',
  other: 'Autre',
};
