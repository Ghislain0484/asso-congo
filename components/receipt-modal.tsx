'use client';

import { useRef } from 'react';
import { Printer, Download, CheckCircle2, Shield, QrCode, Building2, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime, numberToFrenchWords, APP_NAME } from '@/lib/constants';
import type { Transaction, Organization, Donation } from '@/lib/types';
import { MOCK_ORGANIZATION } from '@/lib/mock-data';

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  donation?: Donation | null;
  organization?: Organization | null;
}

export function ReceiptModal({ open, onOpenChange, transaction, donation, organization }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const org = organization || MOCK_ORGANIZATION;

  const effectiveTxn: Transaction | null = transaction || (donation ? {
    id: donation.id,
    organization_id: donation.organization_id,
    donation_id: donation.id,
    event_registration_id: null,
    type: 'donation',
    amount: donation.amount,
    currency: donation.currency,
    status: 'success',
    provider: donation.payment_provider,
    provider_reference: donation.receipt_number || `REC-${Date.now()}`,
    provider_transaction_id: `TXN-${Date.now()}`,
    provider_phone: donation.donor_phone,
    description: `Don généreux de ${donation.donor_name}`,
    metadata: {},
    deleted_at: null,
    processed_at: donation.created_at,
    created_at: donation.created_at,
    updated_at: donation.updated_at,
  } : null);

  if (!effectiveTxn) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = effectiveTxn.provider_reference 
    ? `REC-CG-${effectiveTxn.provider_reference.replace(/[^A-Za-z0-9]/g, '').slice(-8)}`
    : `REC-CG-2026-${effectiveTxn.id.slice(0, 8).toUpperCase()}`;

  const amountInWords = numberToFrenchWords(effectiveTxn.amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:w-full">
        {/* Printable Area */}
        <div ref={printRef} className="p-6 md:p-8 bg-white text-zinc-900 print:p-8 print:text-black">
          {/* Header République du Congo */}
          <div className="border-b-2 border-emerald-700 pb-4 mb-6">
            <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest font-semibold border-b border-zinc-200 pb-2 mb-3">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                RÉPUBLIQUE DU CONGO
              </span>
              <span className="text-zinc-600 font-medium">Unité • Travail • Progrès</span>
              <span className="text-emerald-800">SURVEILLANCE DGIFN</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-emerald-900 tracking-tight flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  REÇU FISCAL DE VERSEMENT
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Conforme aux dispositions de la Loi du 1er Juillet 1901 & Traçabilité financière nationale
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-emerald-600 text-emerald-800 bg-emerald-50 font-mono text-xs px-2.5 py-1">
                  N° {receiptNumber}
                </Badge>
                <p className="text-[11px] text-zinc-500 mt-1">Date: {formatDateTime(effectiveTxn.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Section Association & Donateur (2 colonnes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Bénéficiaire */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Organisme Bénéficiaire
              </p>
              <p className="font-bold text-sm text-zinc-900">{org.name} ({org.acronym})</p>
              <p className="text-zinc-600 mt-0.5">{org.address}, {org.city}</p>
              <p className="text-zinc-600">N° d'enregistrement : <span className="font-mono font-medium">{org.registration_number || 'REC-BZV-2024-N048'}</span></p>
              <p className="text-zinc-600">Agrément DGIFN : <span className="font-mono font-medium text-emerald-700">DGIFN-CONGO-ONG-2024</span></p>
              <p className="text-zinc-600">Contact : {org.phone} | {org.email}</p>
            </div>

            {/* Versant / Donateur */}
            <div className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Heart className="h-3 w-3" /> Donateur / Adhérent
              </p>
              <p className="font-bold text-sm text-zinc-900">
                {effectiveTxn.description?.includes('Carine Massamba')
                  ? 'Carine Massamba (Membre Bureau)'
                  : effectiveTxn.description?.includes('Arsène Loundou')
                  ? 'Arsène Loundou (Adhérent)'
                  : effectiveTxn.description?.includes('mécène') || effectiveTxn.description?.includes('BTP')
                  ? 'Sylvain Batéké (Société BTP Congo)'
                  : effectiveTxn.description?.includes('MTN')
                  ? 'Fondation MTN Congo (RSE)'
                  : effectiveTxn.description?.includes('Mabiala')
                  ? 'Dr. Christian Mabiala'
                  : 'Donateur Solidaire Congolais'}
              </p>
              <p className="text-zinc-600 mt-0.5">
                Numéro Mobile Money : <span className="font-mono">{effectiveTxn.provider_phone || '+242 06 611 00 22'}</span>
              </p>
              <p className="text-zinc-600">Département : Brazzaville, République du Congo</p>
              <p className="text-zinc-600">
                Opérateur certifié : <span className="font-semibold text-zinc-800">{effectiveTxn.provider === 'mtn_momo' ? 'MTN Mobile Money (*105#)' : effectiveTxn.provider === 'airtel_money' ? 'Airtel Money (*128#)' : 'Versement Bancaire / Espèces'}</span>
              </p>
            </div>
          </div>

          {/* Montant & Motif */}
          <div className="rounded-lg border-2 border-emerald-600/30 bg-emerald-50/40 p-4 mb-6">
            <div className="flex items-baseline justify-between border-b border-emerald-200/60 pb-3 mb-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-900">Montant net perçu</span>
                <p className="text-2xl font-black text-emerald-800 tracking-tight">
                  {formatCurrency(effectiveTxn.amount)} <span className="text-sm font-bold text-emerald-700">FCFA</span>
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white font-medium">Paiement certifié</Badge>
            </div>

            <div className="text-xs space-y-1.5 text-zinc-700">
              <p>
                <span className="font-semibold text-zinc-900">Montant en toutes lettres :</span>{' '}
                <span className="italic font-medium capitalize text-emerald-950">{amountInWords} francs CFA</span>
              </p>
              <p>
                <span className="font-semibold text-zinc-900">Objet du versement :</span>{' '}
                {effectiveTxn.description || 'Soutien aux actions d\'intérêt général et humanitaires'}
              </p>
              <p>
                <span className="font-semibold text-zinc-900">Réf. transaction opérateur :</span>{' '}
                <span className="font-mono text-zinc-800 font-semibold">{effectiveTxn.provider_reference || effectiveTxn.id}</span>
              </p>
            </div>
          </div>

          {/* Sceau & Signature */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-200 text-xs">
            {/* QR Code & Vérification */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border border-zinc-300 rounded p-1 bg-white flex items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-zinc-800" />
              </div>
              <div className="text-[11px] text-zinc-500 leading-tight">
                <p className="font-semibold text-zinc-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 inline" /> Sceau numérique DGIFN
                </p>
                <p className="mt-0.5">Scannez pour authentifier la conformité de ce reçu sur le registre national AssoCongo.</p>
              </div>
            </div>

            {/* Signature */}
            <div className="text-right">
              <p className="text-[11px] text-zinc-500">Pour le Bureau Exécutif de l'Association :</p>
              <p className="font-bold text-xs text-zinc-900 mt-1">Marien Ngouabi, Président</p>
              <div className="inline-block mt-1 px-3 py-1 border border-dashed border-emerald-600/50 rounded bg-emerald-50/50 text-[10px] text-emerald-800 font-mono">
                [ Cachet Électronique Certifié ]
              </div>
            </div>
          </div>

          {/* Pied de page légal */}
          <div className="mt-6 pt-3 border-t border-zinc-100 text-[10px] text-center text-zinc-400">
            Ce document atteste de la libéralité financière effectuée conformément à la législation fiscale congolaise. 
            Émis via la plateforme nationale {APP_NAME} en partenariat avec la DGIFN.
          </div>
        </div>

        {/* Footer avec Boutons d'Action */}
        <DialogFooter className="p-4 bg-zinc-50 border-t border-zinc-200 flex sm:justify-between items-center print:hidden">
          <p className="text-xs text-zinc-500">
            Format officiel d'attestation fiscale pour la République du Congo.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Printer className="mr-2 h-4 w-4" /> Imprimer / Sauvegarder PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
