'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Heart,
  Calendar,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Target,
  Building2,
  FileText,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Globe,
  FileCheck,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReceiptModal } from '@/components/receipt-modal';
import { CerReportModal } from '@/components/cer-report-modal';
import { MemberPersonalSpace } from '@/components/member-personal-space';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, timeAgo, STATUS_LABELS } from '@/lib/constants';
import { MOCK_CAMPAIGNS, MOCK_DONATIONS, MOCK_EVENTS, MOCK_MEMBERS, MOCK_TRANSACTIONS, MOCK_ORGANIZATION } from '@/lib/mock-data';
import type { Campaign, Donation, Transaction, Event, Member } from '@/lib/types';

// Données Nationales Macro-Économiques pour la Tour de Contrôle DGIFN (12 départements congolais)
const DEPARTEMENTS_CONGO_STATS = [
  { nom: 'Brazzaville', ongs: 48, flux: 685000000, conformite: 96, statut: 'Optimal' },
  { nom: 'Pointe-Noire', ongs: 34, flux: 412000000, conformite: 94, statut: 'Optimal' },
  { nom: 'Pool (Kinkala)', ongs: 18, flux: 125000000, conformite: 89, statut: 'Régulier' },
  { nom: 'Bouenza (Madingou)', ongs: 11, flux: 58000000, conformite: 86, statut: 'Régulier' },
  { nom: 'Niari (Dolisie)', ongs: 9, flux: 42000000, conformite: 84, statut: 'Régulier' },
  { nom: 'Cuvette (Owando)', ongs: 7, flux: 36000000, conformite: 88, statut: 'Régulier' },
  { nom: 'Sangha (Ouesso)', ongs: 5, flux: 31000000, conformite: 82, statut: 'Vigilance' },
  { nom: 'Kouilou (Hinda)', ongs: 4, flux: 18000000, conformite: 85, statut: 'Régulier' },
  { nom: 'Likouala (Impfondo)', ongs: 3, flux: 12000000, conformite: 79, statut: 'Vigilance' },
  { nom: 'Plateaux (Djambala)', ongs: 2, flux: 8500000, conformite: 78, statut: 'Vigilance' },
  { nom: 'Lékoumou (Sibiti)', ongs: 2, flux: 5500000, conformite: 80, statut: 'Régulier' },
  { nom: 'Cuvette-Ouest (Ewo)', ongs: 1, flux: 3500000, conformite: 82, statut: 'Régulier' },
];

const FLUX_VIGILANCE_ANIF = [
  { ref: 'VIR-UBA-BZV-2026-00412', org: 'Association Espoir Congo (AEC)', montant: 1800000, type: 'Reversement bancaire UBA', motif: 'Règlement 120 tables-bancs Bacongo', seuil: 'Rapprochement OK', statut: 'Certifié DGIFN' },
  { ref: 'MOMO-CG-2026-98441', org: 'Association Espoir Congo (AEC)', montant: 1000000, type: 'Don mécène privé (BTP)', motif: 'Réfection salles de classe Bacongo', seuil: 'Seuil 1M atteint', statut: 'Identité vérifiée' },
  { ref: 'MOMO-CG-2026-99001', org: 'Association Espoir Congo (AEC)', montant: 600000, type: 'Subvention RSE Fondation MTN', motif: 'Bourses numériques jeunes filles', seuil: 'Convention RSE', statut: 'Validé' },
  { ref: 'REC-CASH-BZV-0019', org: 'Association Espoir Congo (AEC)', montant: 500000, type: 'Versement espèces certifié', motif: 'Dr. Mabiala - Bloc sanitaire Bacongo', seuil: 'Quittance certifiée', statut: 'Conforme DGIFN' },
  { ref: 'AIRTEL-CG-2026-91144', org: 'Solidarité Orphelins PNR', montant: 75000, type: 'Don Airtel Money (*128#)', motif: 'Cantine solidaire Tié-Tié', seuil: 'Standard', statut: 'Vérifié' },
];

interface Stats {
  totalCollected: number;
  totalPayouts: number;
  cashBalance: number;
  totalMembers: number;
  activeCampaigns: number;
  upcomingEvents: number;
  recentDonations: Donation[];
  recentTransactions: Transaction[];
  topCampaigns: Campaign[];
  upcomingEventList: Event[];
  totalMembersList: Member[];
}

export default function DashboardOverview() {
  const { currentOrg, profile, demoPersona, setDemoPersona } = useAuth();
  const effectiveOrg = currentOrg || MOCK_ORGANIZATION;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCerModal, setShowCerModal] = useState(false);
  const [viewMode, setViewMode] = useState<'association' | 'regulator'>('association');

  // Synchronisation avec le sélecteur démo global
  useEffect(() => {
    if (demoPersona === 'regulator') {
      setViewMode('regulator');
    } else if (demoPersona === 'association') {
      setViewMode('association');
    }
  }, [demoPersona]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const orgId = effectiveOrg.id;

      let donRes: any = { data: null };
      let memRes: any = { data: null };
      let campRes: any = { data: null };
      let evtRes: any = { data: null };
      let recentDonRes: any = { data: null };
      let recentTxRes: any = { data: null };
      let topCampRes: any = { data: null };
      let upcomingEvtRes: any = { data: null };

      try {
        [donRes, memRes, campRes, evtRes, recentDonRes, recentTxRes, topCampRes, upcomingEvtRes] = await Promise.all([
          supabase.from('donations').select('amount').eq('organization_id', orgId).eq('status', 'completed').is('deleted_at', null),
          supabase.from('members').select('id').eq('organization_id', orgId).is('deleted_at', null),
          supabase.from('campaigns').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null),
          supabase.from('events').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()),
          supabase.from('donations').select('*').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
          supabase.from('transactions').select('*').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(8),
          supabase.from('campaigns').select('*').eq('organization_id', orgId).is('deleted_at', null).order('current_amount', { ascending: false }).limit(4),
          supabase.from('events').select('*').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }).limit(3),
        ]);
      } catch (err) {
        console.warn('Dashboard note: Utilisation des données de secours pour la démo:', err);
      }

      const rawDonations = (recentDonRes?.data || []) as Donation[];
      const rawTransactions = (recentTxRes?.data || []) as Transaction[];
      const rawCampaigns = (topCampRes?.data || []) as Campaign[];
      const rawEvents = (upcomingEvtRes?.data || []) as Event[];

      const hasDbData = (donRes?.data && donRes.data.length > 0) || rawCampaigns.length > 0 || rawTransactions.length > 0;

      const txList = rawTransactions.length > 0 ? rawTransactions : MOCK_TRANSACTIONS;
      const inTx = txList.filter((t) => t.status === 'success' && t.type !== 'payout' && t.type !== 'refund');
      const outTx = txList.filter((t) => t.status === 'success' && (t.type === 'payout' || t.type === 'refund'));
      const totalCollected = inTx.reduce((s, t) => s + t.amount, 0);
      const totalPayouts = outTx.reduce((s, t) => s + t.amount, 0);
      const cashBalance = totalCollected - totalPayouts;

      const totalMembers = hasDbData ? (memRes.data?.length || 0) : MOCK_MEMBERS.length;
      const activeCampaigns = hasDbData ? (campRes.data?.length || 0) : MOCK_CAMPAIGNS.filter((c) => c.status === 'active').length;
      const upcomingEvents = hasDbData ? (evtRes.data?.length || 0) : MOCK_EVENTS.length;

      setStats({
        totalCollected,
        totalPayouts,
        cashBalance,
        totalMembers,
        activeCampaigns,
        upcomingEvents,
        recentDonations: rawDonations.length > 0 ? rawDonations : MOCK_DONATIONS.slice(0, 5),
        recentTransactions: rawTransactions.length > 0 ? rawTransactions : MOCK_TRANSACTIONS.slice(0, 8),
        topCampaigns: rawCampaigns.length > 0 ? rawCampaigns : MOCK_CAMPAIGNS,
        upcomingEventList: rawEvents.length > 0 ? rawEvents : MOCK_EVENTS,
        totalMembersList: MOCK_MEMBERS,
      });
      setLoading(false);
    })();
  }, [currentOrg]);

  // Si l'utilisateur ou la démo est en mode Adhérent (Grace Moukassa - HelloAsso)
  if (demoPersona === 'adherent') {
    return (
      <MemberPersonalSpace onSwitchToAssociation={() => setDemoPersona('association')} />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: 'Collectes totales (Dons & Cotisations)', value: formatCurrencyWithSymbol(stats?.totalCollected || 0), icon: Heart, color: 'text-primary', bg: 'bg-primary/10', trend: '+18%' },
    { label: 'Reversements bancaires (Payout)', value: formatCurrencyWithSymbol(stats?.totalPayouts || 0), icon: ArrowDownRight, color: 'text-info', bg: 'bg-info/10', trend: 'UBA Congo' },
    { label: 'Trésorerie disponible (MoMo/Airtel)', value: formatCurrencyWithSymbol(stats?.cashBalance || 0), icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', trend: 'En caisse' },
    { label: 'Adhérents & Bénévoles', value: `${stats?.totalMembers || 0} membres`, icon: Users, color: 'text-warning', bg: 'bg-warning/10', trend: '100% à jour' },
  ];

  return (
    <div className="space-y-6">
      {/* Bannière de Supervision DGIFN (Régulateur ou Support) */}
      {(profile?.platform_role === 'super_admin' || demoPersona === 'regulator' || viewMode === 'regulator') && (
        <Card className="border-emerald-700/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="w-1/3 bg-[#009543]"></div>
            <div className="w-1/3 bg-[#FBDE4A]"></div>
            <div className="w-1/3 bg-[#DC241F]"></div>
          </div>
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                    Direction Générale des Institutions Financières Nationales (DGIFN)
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                    Supervision Fiscale Active
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-white">
                  Contrôle & Traçabilité Financière • {viewMode === 'regulator' ? 'Tour de Contrôle Nationale (12 Départements)' : effectiveOrg.name}
                </h3>
                <p className="text-xs text-zinc-300">
                  Tutelle Loi 1901 • Récépissé : <strong className="text-white font-mono">{effectiveOrg.registration_number || 'REC-BZV-2024-N048'}</strong> • NIU : <strong className="text-emerald-300 font-mono">M08241100049281X</strong> • Conformité LBC/FT : <strong className="text-emerald-400">96/100 (Très Élevé)</strong>
                </p>
              </div>

              {/* Commutateur de Vue & Boutons d'Action Régaliens */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center bg-black/50 p-1 rounded-lg border border-emerald-500/30">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('association');
                      setDemoPersona('association');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      viewMode === 'association'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    Vue Association (AEC)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('regulator');
                      setDemoPersona('regulator');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      viewMode === 'regulator'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    Tour de Contrôle DGIFN
                  </button>
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowCerModal(true)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                >
                  <FileCheck className="h-3.5 w-3.5" /> CER 2026 (Audit)
                </Button>

                <Link href="/verifier-recu" target="_blank">
                  <Button size="sm" variant="outline" className="text-xs border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10">
                    Vérifier Reçu
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VUE 1 : TOUR DE CONTRÔLE NATIONALE DGIFN & MINISTÈRE */}
      {viewMode === 'regulator' ? (
        <div className="space-y-6 animate-slide-up">
          {/* Header Régulateur */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-600" />
                Supervision Nationale des Flux Financiers Associatifs
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tableau de bord consolidé des 12 départements de la République du Congo sous surveillance DGIFN et Loi 1901
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCerModal(true)}
                className="gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                <FileCheck className="h-4 w-4" /> Compte d'Emploi des Ressources (CER 2026)
              </Button>
              <Link href="/transparence" target="_blank">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                  <Globe className="h-4 w-4" /> Registre Public
                </Button>
              </Link>
            </div>
          </div>

          {/* 4 Cartes Macro Nationales */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 text-[10px]">+24% vs 2025</Badge>
                </div>
                <p className="mt-3 text-2xl font-black font-mono text-emerald-950 dark:text-emerald-100">1 428 500 000 F</p>
                <p className="text-xs text-muted-foreground font-medium">Flux Associatifs Tracés (2026)</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-blue-500 text-blue-700 text-[10px]">12 Départements</Badge>
                </div>
                <p className="mt-3 text-2xl font-black font-mono text-blue-950 dark:text-blue-100">142 ONG Agréées</p>
                <p className="text-xs text-muted-foreground font-medium">Structures immatriculées (Loi 1901)</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/10 text-amber-700">
                    <Shield className="h-5 w-5" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 text-[10px]">Conforme NIU</Badge>
                </div>
                <p className="mt-3 text-2xl font-black font-mono text-amber-950 dark:text-amber-100">89,4%</p>
                <p className="text-xs text-muted-foreground font-medium">Taux de Conformité Fiscale & JORC</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-900 bg-purple-50/20 dark:bg-purple-950/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-700">
                    <ArrowDownRight className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-purple-500 text-purple-700 text-[10px]">UBA / BGFI / Ecobank</Badge>
                </div>
                <p className="mt-3 text-2xl font-black font-mono text-purple-950 dark:text-purple-100">1 185 000 000 F</p>
                <p className="text-xs text-muted-foreground font-medium">Reversements Bancaires Réconciliés</p>
              </CardContent>
            </Card>
          </div>

          {/* Section 1 : Cartographie des 12 Départements Congolais */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    Répartition Territoriale & Cartographie des 12 Départements
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Suivi de la décentralisation associative et des volumes financiers par circonscription
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  Total : 12 Départements
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {DEPARTEMENTS_CONGO_STATS.map((dep, idx) => (
                  <div key={idx} className="rounded-lg border p-3 bg-card hover:bg-muted/40 transition-colors space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm text-foreground">{dep.nom}</p>
                        <p className="text-[11px] text-muted-foreground">{dep.ongs} ONG enregistrées</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          dep.statut === 'Optimal'
                            ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                            : dep.statut === 'Régulier'
                            ? 'border-blue-500 text-blue-700 bg-blue-50'
                            : 'border-amber-500 text-amber-700 bg-amber-50'
                        }`}
                      >
                        {dep.statut}
                      </Badge>
                    </div>
                    <div className="pt-1 border-t flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Volume :</span>
                      <span className="font-mono font-bold text-foreground">{formatCurrency(dep.flux)} F</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Conformité légale :</span>
                      <span className="font-semibold text-emerald-700">{dep.conformite}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 2 : Registre National de Vigilance & Alertes LBC/FT (ANIF / DGIFN) */}
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    Registre National de Vigilance Financière & LBC/FT (Protocole ANIF)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Traçabilité en temps réel des transactions soumises au contrôle de conformité anti-blanchiment
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white text-[10px]">Audit Immuable Actif</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/60 border-b text-[11px] font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Réf. Acte / Transaction</th>
                      <th className="py-2.5 px-3">Association Bénéficiaire</th>
                      <th className="py-2.5 px-3">Nature & Motif Déclaré</th>
                      <th className="py-2.5 px-3 text-right">Montant (FCFA)</th>
                      <th className="py-2.5 px-3">Critère Vigilance</th>
                      <th className="py-2.5 px-3 text-right">Statut DGIFN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {FLUX_VIGILANCE_ANIF.map((flux, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-medium text-foreground">{flux.ref}</td>
                        <td className="py-2.5 px-3 text-foreground font-semibold">{flux.org}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{flux.motif}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">{formatCurrency(flux.montant)}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-800 bg-emerald-50">
                            {flux.seuil}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3 inline" /> {flux.statut}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* VUE 2 : VUE OPÉRATIONNELLE DE L'ONG (ASSOCIATION ESPOIR CONGO) */
        <>
          {/* Header Association */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{effectiveOrg.name}</h1>
              <p className="text-muted-foreground">{effectiveOrg.city}, {effectiveOrg.province}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCerModal(true)}
                className="gap-1.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 text-xs font-semibold"
              >
                <FileCheck className="h-4 w-4" /> Compte d'Emploi des Ressources (CER 2026)
              </Button>
              <Link href="/dashboard/campagnes">
                <Button className="text-xs">Nouvelle campagne</Button>
              </Link>
            </div>
          </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <Card key={i} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                {s.trend && (
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <ArrowUpRight className="h-3 w-3" /> {s.trend}
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top campaigns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Campagnes les plus performantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.topCampaigns.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucune campagne pour le moment</p>
            ) : (
              stats?.topCampaigns.map((c) => {
                const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) : 0;
                return (
                  <Link key={c.id} href={`/dashboard/campagnes/${c.id}`}>
                    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">{c.title}</h4>
                        <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                          {STATUS_LABELS[c.status]}
                        </Badge>
                      </div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-primary">{formatCurrency(c.current_amount)} FCFA</span>
                        <span className="text-muted-foreground">sur {formatCurrency(c.goal_amount)}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="mt-1 text-xs text-muted-foreground">{pct}% atteint</p>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Upcoming events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evenements a venir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.upcomingEventList.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucun evenement a venir</p>
            ) : (
              stats?.upcomingEventList.map((e) => (
                <Link key={e.id} href={`/dashboard/evenements/${e.id}`}>
                  <div className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
                    <div className="mb-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-medium">{e.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(e.start_date)} - {e.location}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transactions recentes</CardTitle>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recentTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Aucune transaction pour le moment</p>
          ) : (
            <div className="space-y-2">
              {stats?.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      tx.status === 'success' ? 'bg-success/10 text-success' : tx.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(tx.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className={`text-sm font-bold ${tx.type === 'refund' || tx.type === 'payout' ? 'text-destructive' : 'text-primary'}`}>
                      {tx.type === 'refund' || tx.type === 'payout' ? '-' : '+'}{formatCurrency(tx.amount)} FCFA
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">{STATUS_LABELS[tx.status] || tx.status}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTx(tx)}
                        className="h-6 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-1.5"
                      >
                        <FileText className="mr-1 h-3 w-3" /> Reçu
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}

      {/* Modal Reçu Fiscal */}
      <ReceiptModal
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        transaction={selectedTx}
        organization={effectiveOrg}
      />

      {/* Modal Compte d'Emploi des Ressources (CER 2026) */}
      <CerReportModal
        open={showCerModal}
        onOpenChange={setShowCerModal}
        organization={effectiveOrg}
      />
    </div>
  );
}
