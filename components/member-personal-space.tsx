'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Receipt,
  Ticket,
  Heart,
  CheckCircle2,
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Building2,
  User,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MembershipCardModal } from '@/components/membership-card-modal';
import { ReceiptModal } from '@/components/receipt-modal';
import { EventTicketModal } from '@/components/event-ticket-modal';
import { formatCurrency, formatCurrencyWithSymbol, formatDate } from '@/lib/constants';
import {
  MOCK_ORGANIZATION,
  MOCK_MEMBERS,
  MOCK_EVENTS,
  MOCK_EVENT_REGISTRATIONS,
  MOCK_CAMPAIGNS,
  MOCK_TRANSACTIONS,
} from '@/lib/mock-data';
import type { Member, Transaction, Event, EventRegistration } from '@/lib/types';

interface MemberPersonalSpaceProps {
  onSwitchToAssociation?: () => void;
}

export function MemberPersonalSpace({ onSwitchToAssociation }: MemberPersonalSpaceProps) {
  // Grace Moukassa (adherent@espoircongo.cg)
  const graceMember: Member = MOCK_MEMBERS.find((m) => m.email === 'adherent@espoircongo.cg') || MOCK_MEMBERS[2];
  const dicteeEvent: Event = MOCK_EVENTS[0];
  const graceRegistration: EventRegistration = MOCK_EVENT_REGISTRATIONS[0];

  const graceDonationTx: Transaction = MOCK_TRANSACTIONS.find((t) => t.id === 'txn-grace-don-01') || {
    id: 'txn-grace-don-01',
    organization_id: MOCK_ORGANIZATION.id,
    donation_id: 'don-grace-01',
    event_registration_id: null,
    type: 'donation',
    amount: 25000,
    currency: 'XAF',
    status: 'success',
    provider: 'mtn_momo',
    provider_reference: 'MOMO-CG-2026-99312',
    provider_transaction_id: 'TXN-MTN-99312',
    provider_phone: '+242 05 500 00 04',
    description: 'Don solidaire réfection école Bacongo - Grace Moukassa',
    metadata: {},
    deleted_at: null,
    processed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const graceCotisTx: Transaction = MOCK_TRANSACTIONS.find((t) => t.id === 'txn-grace-cotis-01') || {
    id: 'txn-grace-cotis-01',
    organization_id: MOCK_ORGANIZATION.id,
    donation_id: null,
    event_registration_id: null,
    type: 'membership_fee',
    amount: 10000,
    currency: 'XAF',
    status: 'success',
    provider: 'mtn_momo',
    provider_reference: 'MOMO-CG-2026-96041',
    provider_transaction_id: 'TXN-MTN-96041',
    provider_phone: '+242 05 500 00 04',
    description: 'Cotisation statutaire annuelle adhérent 2026 (Grace Moukassa)',
    metadata: {},
    deleted_at: null,
    processed_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Modals state
  const [showCardModal, setShowCardModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  const bacongoCampaign = MOCK_CAMPAIGNS[0];

  return (
    <div className="space-y-6">
      {/* Bannière Profil Adhérente (HelloAsso Citizen Space) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-zinc-950 p-6 md:p-8 text-white shadow-lg border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-2xl shadow-inner border-2 border-white/20 shrink-0">
              GM
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  Grace Moukassa
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
                  Adhérente Certifiée 2026
                </Badge>
                <Badge variant="outline" className="border-white/20 text-zinc-300 text-xs font-mono">
                  Matricule : {graceMember.card_number}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-zinc-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  {MOCK_ORGANIZATION.name} ({MOCK_ORGANIZATION.acronym})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  Brazzaville, Arrondissement Bacongo
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowCardModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 shadow-md"
            >
              <CreditCard className="h-4 w-4" /> Ma Carte d'Adhérent
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTxForReceipt(graceDonationTx);
                setShowReceiptModal(true);
              }}
              className="border-white/20 text-white hover:bg-white/10 gap-2"
            >
              <Receipt className="h-4 w-4 text-emerald-400" /> Reçu Fiscal (25 000 FCFA)
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes d'État & Synthèse Adhérent (4 blocs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Statut Cotisation */}
        <Card className="border-emerald-200/60 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Cotisation 2026</span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-emerald-900">À jour</div>
            <p className="text-xs text-muted-foreground mt-1">10 000 FCFA réglés via MTN MoMo</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowCardModal(true)}
              className="p-0 h-auto text-xs font-semibold text-emerald-700 mt-2"
            >
              Afficher le justificatif →
            </Button>
          </CardContent>
        </Card>

        {/* Dons cumulés & Reçus Fiscaux */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Dons & Libéralités</span>
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                <Heart className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-zinc-900">25 000 FCFA</div>
            <p className="text-xs text-muted-foreground mt-1">1 reçu fiscal Loi 1901 disponible</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSelectedTxForReceipt(graceDonationTx);
                setShowReceiptModal(true);
              }}
              className="p-0 h-auto text-xs font-semibold text-primary mt-2"
            >
              Télécharger mon reçu →
            </Button>
          </CardContent>
        </Card>

        {/* Billetterie & Inscriptions */}
        <Card className="border-amber-200/60 bg-amber-50/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Mon Billet d'Événement</span>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-zinc-900">1 Billet Actif</div>
            <p className="text-xs text-muted-foreground mt-1">Grande Dictée Bacongo (Accès validé)</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowTicketModal(true)}
              className="p-0 h-auto text-xs font-semibold text-amber-700 mt-2"
            >
              Ouvrir mon billet avec QR code →
            </Button>
          </CardContent>
        </Card>

        {/* Engagement Bénévole */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Rôle Statutaire</span>
              <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                <User className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-zinc-900">Bénévole Active</div>
            <p className="text-xs text-muted-foreground mt-1">Soutien scolaire Bacongo</p>
            <span className="inline-block mt-2 text-[11px] font-mono font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Commission Éducation AEC
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Gauche : Historique des Versements Personnels & Reçus Fiscaux (2 colonnes) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" /> Mes Versements & Reçus Fiscaux Personnels
                </CardTitle>
                <CardDescription className="text-xs">
                  Chaque versement fait l'objet d'un reçu fiscal Loi 1901 certifié par la DGIFN.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-600 text-emerald-800 bg-emerald-50 text-xs font-medium">
                Conformité 100%
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {/* Ligne 1 : Don réfection école */}
                <div className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">
                          Don solidaire • Réfection École Bacongo
                        </span>
                        <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">Payé</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        MTN Mobile Money (*105#) • Réf. MOMO-CG-2026-99312
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        N° Reçu : REC-DGIFN-2026-004825
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold font-mono text-base text-zinc-900">25 000 FCFA</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTxForReceipt(graceDonationTx);
                        setShowReceiptModal(true);
                      }}
                      className="mt-1 h-7 text-xs border-emerald-600 text-emerald-800 hover:bg-emerald-50 gap-1.5"
                    >
                      <Download className="h-3 w-3" /> Reçu Fiscal
                    </Button>
                  </div>
                </div>

                {/* Ligne 2 : Cotisation annuelle 2026 */}
                <div className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800 shrink-0 mt-0.5">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-900">
                          Cotisation Statutaire Annuelle 2026
                        </span>
                        <Badge className="bg-sky-600 text-white text-[10px] px-1.5 py-0">Validé</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        MTN Mobile Money (*105#) • Adhésion Exercice 2026
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        N° Reçu : REC-CG-COTIS-00101
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold font-mono text-base text-zinc-900">10 000 FCFA</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTxForReceipt(graceCotisTx);
                        setShowReceiptModal(true);
                      }}
                      className="mt-1 h-7 text-xs border-zinc-300 text-zinc-700 hover:bg-zinc-50 gap-1.5"
                    >
                      <Download className="h-3 w-3" /> Quittance
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mon Billet pour la Grande Dictée de Bacongo */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-emerald-700" /> Mon Billet Électronique d'Événement
                </CardTitle>
                <Badge className="bg-emerald-600 text-white text-xs">Inscription Confirmée</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed border-emerald-500/50 bg-gradient-to-br from-emerald-50/50 to-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base text-zinc-900">
                      {dicteeEvent.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dicteeEvent.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-600 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-emerald-700" /> {formatDate(dicteeEvent.start_date)}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-emerald-700" /> {dicteeEvent.venue}
                      </span>
                      <span className="font-mono text-emerald-800 font-semibold">
                        Billet : TCK-CG-DICTEE-0101
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      onClick={() => setShowTicketModal(true)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs"
                    >
                      <Ticket className="h-4 w-4" /> Afficher & Imprimer le Billet
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite : Impact & Actions Citoyennes */}
        <div className="space-y-6">
          {/* Suivi du Projet Soutenu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Projet en Cours dans votre Quartier
              </CardTitle>
              <CardDescription className="text-xs">
                Avancement de la collecte soutenue par votre don.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800">{bacongoCampaign.title}</span>
                  <span className="font-mono font-bold text-emerald-700">61%</span>
                </div>
                <Progress value={61} className="h-2" />
                <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1.5 font-mono">
                  <span>{formatCurrencyWithSymbol(bacongoCampaign.current_amount)} collectés</span>
                  <span>Obj : {formatCurrencyWithSymbol(bacongoCampaign.goal_amount)}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5">
                <p className="font-semibold text-zinc-900">Emploi de votre don :</p>
                <p className="text-muted-foreground leading-relaxed">
                  Votre contribution de 25 000 FCFA est allouée à la réfection des toitures en tôle et à l'achat des tables-bancs en bois local pour les élèves de Bacongo.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Contrôle DGIFN actif
                  </span>
                  <Link href={`/o/${MOCK_ORGANIZATION.slug}`} className="text-primary hover:underline font-medium">
                    Voir la page publique →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Identité Adhérent Miniature */}
          <Card className="bg-slate-900 text-white border-emerald-900/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-emerald-400">CARTE OFFICIELLE</p>
                  <p className="text-xs font-bold text-white">{MOCK_ORGANIZATION.name}</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                  2026
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-zinc-300">
                <p>Titulaire : <strong className="text-white">Grace Moukassa</strong></p>
                <p>Matricule : <span className="font-mono text-emerald-400">{graceMember.card_number}</span></p>
                <p>Validité : <span className="font-mono text-white">31/12/2026</span></p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCardModal(true)}
                className="w-full border-white/20 text-white hover:bg-white/10 text-xs mt-2"
              >
                Imprimer le Format Recto/Verso A4
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales Interactives */}
      <MembershipCardModal
        open={showCardModal}
        onOpenChange={setShowCardModal}
        member={graceMember}
        organization={MOCK_ORGANIZATION}
      />

      <ReceiptModal
        open={showReceiptModal}
        onOpenChange={setShowReceiptModal}
        transaction={selectedTxForReceipt}
        organization={MOCK_ORGANIZATION}
      />

      <EventTicketModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        event={dicteeEvent}
        registration={graceRegistration}
        organization={MOCK_ORGANIZATION}
      />
    </div>
  );
}
