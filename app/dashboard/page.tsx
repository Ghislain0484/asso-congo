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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, timeAgo, STATUS_LABELS } from '@/lib/constants';
import type { Campaign, Donation, Transaction, Event, Member } from '@/lib/types';

interface Stats {
  totalDonations: number;
  totalTips: number;
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
  const { currentOrg } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const orgId = currentOrg.id;

      const [donRes, tipRes, memRes, campRes, evtRes, recentDonRes, recentTxRes, topCampRes, upcomingEvtRes] = await Promise.all([
        supabase.from('donations').select('amount').eq('organization_id', orgId).eq('status', 'completed').is('deleted_at', null),
        supabase.from('tips').select('amount').eq('organization_id', orgId).eq('status', 'completed'),
        supabase.from('members').select('id').eq('organization_id', orgId).is('deleted_at', null),
        supabase.from('campaigns').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null),
        supabase.from('events').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()),
        supabase.from('donations').select('*').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
        supabase.from('transactions').select('*').eq('organization_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(8),
        supabase.from('campaigns').select('*').eq('organization_id', orgId).is('deleted_at', null).order('current_amount', { ascending: false }).limit(4),
        supabase.from('events').select('*').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }).limit(3),
      ]);

      const totalDonations = (donRes.data || []).reduce((s: number, d: { amount: number }) => s + d.amount, 0);
      const totalTips = (tipRes.data || []).reduce((s: number, t: { amount: number }) => s + t.amount, 0);

      setStats({
        totalDonations,
        totalTips,
        totalMembers: memRes.data?.length || 0,
        activeCampaigns: campRes.data?.length || 0,
        upcomingEvents: evtRes.data?.length || 0,
        recentDonations: (recentDonRes.data || []) as Donation[],
        recentTransactions: (recentTxRes.data || []) as Transaction[],
        topCampaigns: (topCampRes.data || []) as Campaign[],
        upcomingEventList: (upcomingEvtRes.data || []) as Event[],
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
    { label: 'Total des dons', value: formatCurrencyWithSymbol(stats?.totalDonations || 0), icon: Heart, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%' },
    { label: 'Pourboires', value: formatCurrencyWithSymbol(stats?.totalTips || 0), icon: TrendingUp, color: 'text-secondary', bg: 'bg-secondary/10', trend: '+8%' },
    { label: 'Membres', value: String(stats?.totalMembers || 0), icon: Users, color: 'text-info', bg: 'bg-info/10', trend: '+5' },
    { label: 'Campagnes actives', value: String(stats?.activeCampaigns || 0), icon: Target, color: 'text-warning', bg: 'bg-warning/10', trend: '' },
  ];

  return (
    <div className="space-y-6">
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
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'refund' || tx.type === 'payout' ? 'text-destructive' : 'text-primary'}`}>
                      {tx.type === 'refund' || tx.type === 'payout' ? '-' : '+'}{formatCurrency(tx.amount)} FCFA
                    </p>
                    <Badge variant="outline" className="text-xs">{STATUS_LABELS[tx.status] || tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
