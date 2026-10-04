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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReceiptModal } from '@/components/receipt-modal';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, timeAgo, STATUS_LABELS } from '@/lib/constants';
import { MOCK_CAMPAIGNS, MOCK_DONATIONS, MOCK_EVENTS, MOCK_MEMBERS, MOCK_TRANSACTIONS } from '@/lib/mock-data';
import type { Campaign, Donation, Transaction, Event, Member } from '@/lib/types';

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
  const { currentOrg, profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!currentOrg) {
      const allTx = MOCK_TRANSACTIONS;
      const inTx = allTx.filter((t) => t.status === 'success' && t.type !== 'payout' && t.type !== 'refund');
      const outTx = allTx.filter((t) => t.status === 'success' && (t.type === 'payout' || t.type === 'refund'));
      const totalIn = inTx.reduce((s, t) => s + t.amount, 0);
      const totalOut = outTx.reduce((s, t) => s + t.amount, 0);

      setStats({
        totalCollected: totalIn,
        totalPayouts: totalOut,
        cashBalance: totalIn - totalOut,
        totalMembers: MOCK_MEMBERS.length,
        activeCampaigns: MOCK_CAMPAIGNS.filter((c) => c.status === 'active').length,
        upcomingEvents: MOCK_EVENTS.length,
        recentDonations: MOCK_DONATIONS.slice(0, 5),
        recentTransactions: MOCK_TRANSACTIONS.slice(0, 8),
        topCampaigns: MOCK_CAMPAIGNS,
        upcomingEventList: MOCK_EVENTS,
        totalMembersList: MOCK_MEMBERS,
      });
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const orgId = currentOrg.id;

      const [donRes, memRes, campRes, evtRes, recentDonRes, recentTxRes, topCampRes, upcomingEvtRes] = await Promise.all([
        supabase.from('donations').select('amount').eq('organization_id', orgId).eq('status', 'completed').is('deleted_at', null),
        supabase.from('members').select('id').eq('organization_id', orgId).is('deleted_at', null),
        supabase.from('campaigns').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null),
        supabase.from('events').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()),
        supabase.from('donations').select('*').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
        supabase.from('transactions').select('*').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(8),
        supabase.from('campaigns').select('*').eq('organization_id', orgId).is('deleted_at', null).order('current_amount', { ascending: false }).limit(4),
        supabase.from('events').select('*').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }).limit(3),
      ]);

      const rawDonations = (recentDonRes.data || []) as Donation[];
      const rawTransactions = (recentTxRes.data || []) as Transaction[];
      const rawCampaigns = (topCampRes.data || []) as Campaign[];
      const rawEvents = (upcomingEvtRes.data || []) as Event[];

      const hasDbData = (donRes.data && donRes.data.length > 0) || rawCampaigns.length > 0 || rawTransactions.length > 0;

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
        totalMembersList: [],
      });
      setLoading(false);
    })();
  }, [currentOrg]);

  if (!currentOrg) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Aucune organisation trouvée</h3>
        <p className="text-sm text-muted-foreground mb-4">Créez votre première ONG pour accéder à toutes les fonctionnalités du tableau de bord.</p>
        <Link href="/register">
          <Button>Créer une ONG</Button>
        </Link>
      </div>
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
      {profile?.platform_role === 'super_admin' && (
        <Card className="border-emerald-700/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="w-1/3 bg-[#009543]"></div>
            <div className="w-1/3 bg-[#FBDE4A]"></div>
            <div className="w-1/3 bg-[#DC241F]"></div>
          </div>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  Contrôle & Traçabilité Financière • {currentOrg.name}
                </h3>
                <p className="text-xs text-zinc-300">
                  N° Enregistrement : <strong className="text-white font-mono">{currentOrg.registration_number || 'REC-BZV-2024-N048'}</strong> • Agrément DGIFN : <strong className="text-emerald-300 font-mono">CONGO-ONG-2024-019</strong> • Conformité AML/CFT : <strong className="text-emerald-400">96/100 (Très Élevé)</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href="/transparence" target="_blank">
                  <Button size="sm" variant="outline" className="text-xs border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10">
                    Registre National
                  </Button>
                </Link>
                <Link href="/dashboard/transactions">
                  <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    Audit des Flux (MoMo & Banques)
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{currentOrg.name}</h1>
          <p className="text-muted-foreground">{currentOrg.city}, {currentOrg.province}</p>
        </div>
        <Link href="/dashboard/campagnes">
          <Button>Nouvelle campagne</Button>
        </Link>
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

      {/* Modal Reçu Fiscal */}
      <ReceiptModal
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        transaction={selectedTx}
        organization={currentOrg}
      />
    </div>
  );
}
