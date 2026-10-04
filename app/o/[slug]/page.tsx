'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Users,
  Calendar,
  Target,
  Shield,
  Globe,
  ArrowRight,
  QrCode,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, STATUS_LABELS } from '@/lib/constants';
import type { Organization, Campaign, Event, Donation } from '@/lib/types';

export default function PublicOrgPage() {
  const { slug } = useParams();
  const [org, setOrg] = useState<Organization | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campagnes' | 'evenements' | 'transparence'>('campagnes');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: orgData } = await supabase.from('organizations').select('*').eq('slug', slug).maybeSingle();
      if (orgData) {
        setOrg(orgData as Organization);
        const [campRes, evtRes, donRes] = await Promise.all([
          supabase.from('campaigns').select('*').eq('organization_id', orgData.id).eq('status', 'active').is('deleted_at', null).order('created_at', { ascending: false }),
          supabase.from('events').select('*').eq('organization_id', orgData.id).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }),
          supabase.from('donations').select('*').eq('organization_id', orgData.id).eq('status', 'completed').is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
        ]);
        if (campRes.data) setCampaigns(campRes.data as Campaign[]);
        if (evtRes.data) setEvents(evtRes.data as Event[]);
        if (donRes.data) setDonations(donRes.data as Donation[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">ONG introuvable</h1>
        <p className="mt-2 text-muted-foreground">Cette association n'existe pas ou n'est plus active.</p>
        <Link href="/"><Button className="mt-4">Retour a l'accueil</Button></Link>
      </div>
    );
  }

  const totalRaised = donations.reduce((s, d) => s + d.amount, 0);
  const totalTips = donations.reduce((s, d) => s + d.tip_amount, 0);
  const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/o/${org.slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-primary">AssoCongo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
            <Link href={`/o/${org.slug}/don`}><Button size="sm"><Heart className="mr-2 h-4 w-4" /> Faire un don</Button></Link>
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-primary to-secondary md:h-64">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="container mx-auto max-w-5xl px-4">
        {/* Org info */}
        <div className="-mt-12 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-background bg-primary/10 text-3xl font-bold text-primary shadow-lg">
              {org.name[0]}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold">{org.name}</h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" /> {org.city}, {org.province}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {org.is_verified && <Badge className="bg-primary/10 text-primary"><Shield className="mr-1 h-3 w-3" /> Verifiee</Badge>}
                {org.domains.slice(0, 3).map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/o/${org.slug}/don`}>
              <Button size="lg"><Heart className="mr-2 h-4 w-4" /> Faire un don</Button>
            </Link>
          </div>
        </div>

        {/* Description */}
        {org.description && (
          <p className="mb-6 text-muted-foreground">{org.description}</p>
        )}

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-xl font-bold">{formatCurrency(totalRaised)} F</p>
              <p className="text-xs text-muted-foreground">Total collecte</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-xl font-bold">{donations.length}</p>
              <p className="text-xs text-muted-foreground">Dons</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-xl font-bold">{campaigns.length}</p>
              <p className="text-xs text-muted-foreground">Campagnes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">Evenements</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b">
          {(['campagnes', 'evenements', 'transparence'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'campagnes' && (
          <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.length === 0 ? (
              <Card className="col-span-full"><CardContent className="py-16 text-center text-muted-foreground">Aucune campagne active</CardContent></Card>
            ) : (
              campaigns.map((c) => {
                const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) : 0;
                return (
                  <Link key={c.id} href={`/o/${org.slug}/campagnes/${c.slug}`}>
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20" />
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-semibold">{c.title}</h3>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-bold text-primary">{formatCurrency(c.current_amount)} F</span>
                          <span className="text-muted-foreground">/ {formatCurrency(c.goal_amount)}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                        <p className="mt-2 text-xs text-muted-foreground">{pct}% atteint</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'evenements' && (
          <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <Card className="col-span-full"><CardContent className="py-16 text-center text-muted-foreground">Aucun evenement a venir</CardContent></Card>
            ) : (
              events.map((e) => (
                <Link key={e.id} href={`/o/${org.slug}/evenements/${e.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2">{formatDate(e.start_date)}</Badge>
                      <h3 className="mb-2 font-semibold">{e.title}</h3>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3 w-3" /> {e.location}</p>
                      {e.registration_fee > 0 && <p className="mt-2 font-medium text-primary">{formatCurrency(e.registration_fee)} FCFA</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'transparence' && (
          <div className="mb-12 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary" /> Indicateurs de transparence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalRaised)} F</p>
                    <p className="text-xs text-muted-foreground">Dons collectes</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalTips)} F</p>
                    <p className="text-xs text-muted-foreground">Pourboires recoltes</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{donations.length}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold">{org.transparency_score}/100</p>
                    <p className="text-xs text-muted-foreground">Score transparence</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Journal d\'audit actif', active: true },
                    { label: 'Tracabilite Mobile Money', active: true },
                    { label: 'Reus automatiques', active: true },
                    { label: 'Exports disponibles (CSV)', active: true },
                    { label: 'Alignement DGIFN', active: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success" /> {item.label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dons recents (public)</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Aucun don public pour le moment</p>
                ) : (
                  <div className="space-y-2">
                    {donations.slice(0, 10).map((d) => (
                      <div key={d.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{d.donor_is_anonymous ? 'Donateur anonyme' : d.donor_name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(d.created_at)}</p>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(d.amount)} F</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Code section */}
        <Card className="mb-12">
          <CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row md:justify-between">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold"><QrCode className="h-5 w-5 text-primary" /> Partagez cette ONG</h3>
              <p className="text-sm text-muted-foreground">Scannez le QR code pour acceder a la page publique et faire un don.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg border-2 border-primary/20 bg-white p-4">
                <QrCode className="h-24 w-24 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">{qrUrl}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact info */}
      <div className="border-t bg-muted/30 py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <h3 className="mb-4 text-lg font-semibold">Contact</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {org.email && <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><span className="text-sm">{org.email}</span></div>}
            {org.phone && <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span className="text-sm">{org.phone}</span></div>}
            {org.website && <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-primary" /><span className="text-sm">{org.website}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
