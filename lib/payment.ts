// Payment provider abstraction for Mobile Money operators in Congo
// This is a mock implementation ready for real API integration

import type { PaymentProvider } from './types';

export interface PaymentRequest {
  amount: number;
  currency: string;
  provider: PaymentProvider;
  phone: string;
  reference: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  providerReference: string | null;
  providerTransactionId: string | null;
  status: 'pending' | 'success' | 'failed';
  message: string;
  redirectUrl?: string;
}

export interface PaymentProviderConfig {
  id: PaymentProvider;
  name: string;
  color: string;
  logo: string;
  ussdCode: string;
  enabled: boolean;
}

export const PAYMENT_PROVIDERS: Record<PaymentProvider, PaymentProviderConfig> = {
  mtn_momo: {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    color: '#ffcc00',
    logo: 'MTN',
    ussdCode: '*105#',
    enabled: true,
  },
  airtel_money: {
    id: 'airtel_money',
    name: 'Airtel Money',
    color: '#e40000',
    logo: 'AM',
    ussdCode: '*128#',
    enabled: true,
  },
  monetbil: {
    id: 'monetbil',
    name: 'Monetbil (Agrégateur)',
    color: '#1a73e8',
    logo: 'MB',
    ussdCode: '*126#',
    enabled: true,
  },
  cash: {
    id: 'cash',
    name: 'Espèces',
    color: '#6b7280',
    logo: 'CASH',
    ussdCode: '',
    enabled: true,
  },
  orange_money: {
    id: 'orange_money',
    name: 'Orange Money (Inactif)',
    color: '#ff7900',
    logo: 'OM',
    ussdCode: '#144#',
    enabled: false,
  },
  other: {
    id: 'other',
    name: 'Autre',
    color: '#6b7280',
    logo: '?',
    ussdCode: '',
    enabled: false,
  },
};

export const ENABLED_PROVIDERS = (Object.values(PAYMENT_PROVIDERS) as PaymentProviderConfig[]).filter(
  (p) => p.enabled
);

// Mock payment processor — simulates Mobile Money flow
// In production, replace with actual API calls to each operator
export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  const providerRef = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Simulate async payment processing
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate 90% success rate
  const isSuccess = Math.random() > 0.1;

  if (request.provider === 'cash') {
    return {
      success: true,
      providerReference: providerRef,
      providerTransactionId: `CASH-${providerRef}`,
      status: 'success',
      message: 'Paiement en espèces enregistré',
    };
  }

  if (isSuccess) {
    return {
      success: true,
      providerReference: providerRef,
      providerTransactionId: `TXN-${providerRef}`,
      status: 'success',
      message: `Paiement de ${request.amount.toLocaleString('fr-FR')} ${request.currency} confirmé via ${PAYMENT_PROVIDERS[request.provider].name}`,
    };
  }

  return {
    success: false,
    providerReference: providerRef,
    providerTransactionId: null,
    status: 'failed',
    message: 'Le paiement a échoué. Veuillez réessayer ou utiliser un autre opérateur.',
  };
}

// Suggested tip amounts (HelloAsso model)
export const TIP_SUGGESTIONS = [
  { label: ' gratuit', value: 0 },
  { label: ' +500 F', value: 500 },
  { label: ' +1 000 F', value: 1000 },
  { label: ' +2 000 F', value: 2000 },
  { label: 'Montant libre', value: -1 },
];

// Quick donation amount suggestions
export const DONATION_SUGGESTIONS = [1000, 2500, 5000, 10000, 25000, 50000];
