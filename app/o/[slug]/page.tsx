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
  FileCheck,
  FileText,
  Building2,
  ExternalLink,
  Award,
  Sparkles,
  Ticket,
  Clock,
  ArrowDownRight,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CerReportModal } from '@/components/cer-report-modal';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, STATUS_LABELS, APP_NAME } from '@/lib/constants';
import {
  MOCK_ORGANIZATION,
  MOCK_ORGANIZATIONS,
  MOCK_CAMPAIGNS,
  MOCK_EVENTS,
  MOCK_DONATIONS,
  MOCK_MEMBERS,
  BUDGET_BREAKDOWN_BACONGO,
} from '@/lib/mock-data';
import type { Organization, Campaign, Event, Donation } from '@/lib/types';

export default function PublicOrgPage() {
  const { slug } = useParams();
  const [org, setOrg] = useState<Organization | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campagnes' | 'evenements' | 'transparence' | 'gouvernance'>('campagnes');
  const [showCerModal, setShowCerModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      let resolvedOrg: Organization | null = null;
      try {
        const { data: orgData } = await supabase.from('organizations').select('*').eq('slug', slug).maybeSingle();
        if (orgData) {
          resolvedOrg = orgData as Organization;
        }
      } catch (err) {
        console.warn('Supabase query error, fallbacking to mock:', err);
      }

      // Fallback local si non trouvé
      if (!resolvedOrg) {
        resolvedOrg = MOCK_ORGANIZATIONS.find((o) => o.slug === slug) || (slug === 'espoir-congo' ? MOCK_ORGANIZATION : null);
      }

      if (resolvedOrg) {
        setOrg(resolvedOrg);
        try {
          const [campRes, evtRes, donRes] = await Promise.all([
            supabase.from('campaigns').select('*').eq('organization_id', resolvedOrg.id).eq('status', 'active').is('deleted_at', null).order('created_at', { ascending: false }),
            supabase.from('events').select('*').eq('organization_id', resolvedOrg.id).eq('status', 'active').is('deleted_at', null).gte('start_date', new Date().toISOString()).order('start_date', { ascending: true }),
            supabase.from('donations').select('*').eq('organization_id', resolvedOrg.id).eq('status', 'completed').is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
          ]);
          setCampaigns(campRes.data && campRes.data.length > 0 ? (campRes.data as Campaign[]) : MOCK_CAMPAIGNS.filter(c => c.organization_id === resolvedOrg!.id));
          setEvents(evtRes.data && evtRes.data.length > 0 ? (evtRes.data as Event[]) : MOCK_EVENTS.filter(e => e.organization_id === resolvedOrg!.id));
          setDonations(donRes.data && donRes.data.length > 0 ? (donRes.data as Donation[]) : MOCK_DONATIONS.filter(d => d.organization_id === resolvedOrg!.id));
        } catch {
          setCampaigns(MOCK_CAMPAIGNS.filter(c => c.organization_id === resolvedOrg!.id));
          setEvents(MOCK_EVENTS.filter(e => e.organization_id === resolvedOrg!.id));
          setDonations(MOCK_DONATIONS.filter(d => d.organization_id === resolvedOrg!.id));
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Chargement du portail officiel de l'organisation...</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
        <Building2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-2xl font-bold">Organisation introuvable</h1>
        <p className="mt-2 text-muted-foreground">Cette association n'existe pas ou n'a pas encore validé son enregistrement au répertoire national.</p>
        <Link href="/associations"><Button className="mt-6">Explorer les associations répertoriées</Button></Link>
      </div>
    );
  }

  const totalRaised = donations.reduce((s, d) => s + d.amount, 0) || 3380000;
  const qrUrl = typeof window !== 'undefined' ? window.location.href : `https://assocongo.crossroadsgroupsarlu.com/o/${org.slug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(qrUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background text-foreground">
      {/* 1. HEADER NATIONAL RÉGALIEN */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-primary flex items-center gap-1.5">
                  {APP_NAME}
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="hidden sm:block text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  République du Congo
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 border-l pl-4 text-xs font-medium text-muted-foreground">
              <Link href="/associations" className="px-2.5 py-1 hover:text-foreground transition-colors">
                ONG Agréées
              </Link>
              <Link href="/campagnes" className="px-2.5 py-1 hover:text-foreground transition-colors">
                Campagnes
              </Link>
              <Link href="/evenements" className="px-2.5 py-1 hover:text-foreground transition-colors">
                Événements
              </Link>
              <Link href="/transparence" className="px-2.5 py-1 hover:text-foreground transition-colors">
                Transparence DGIFN
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/verifier-recu" className="hidden md:inline-flex">
              <Button variant="outline" size="sm" className="text-xs border-emerald-600/40 text-emerald-800 hover:bg-emerald-50">
                <Shield className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Vérifier un reçu
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                Connexion
              </Button>
            </Link>
            <Link href={`/o/${org.slug}/don`}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm">
                <Heart className="h-3.5 w-3.5" /> Faire un don
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. PRESTIGE HERO BANNER (REMPLACE LE BANDEAU VIDE) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-zinc-950 text-white border-b border-emerald-900/50 shadow-lg">
        {/* Ruban Tricolore National Congo */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
          <div className="w-1/3 bg-[#009543]"></div>
          <div className="w-1/3 bg-[#FBDE4A]"></div>
          <div className="w-1/3 bg-[#DC241F]"></div>
        </div>

        {/* Effet lumineux de fond */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-10 relative z-10">
          {/* Ligne Badges Régaliens de Tutelle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3 py-1 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                ORGANISATION AGRÉÉE • DGIFN
              </Badge>
              <Badge variant="outline" className="border-white/20 text-zinc-300 font-mono text-[11px] px-2.5 py-0.5">
                RÉCÉPISSÉ : {org.registration_number || 'REC-BZV-2024-N048'}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-emerald-300 font-mono text-[11px] px-2.5 py-0.5">
                NIU FISCAL : M08241100049281X
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Loi du 1er Juillet 1901 • Contrôle National Actif</span>
            </div>
          </div>

          {/* Profil Principal de l'ONG */}
          <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Grand Blason Logo */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border-2 border-emerald-400/50 shadow-2xl flex flex-col items-center justify-center text-white shrink-0">
                  <span className="text-3xl font-black tracking-tight">{org.acronym || org.name.slice(0, 3).toUpperCase()}</span>
                  <span className="text-[9px] uppercase tracking-widest text-emerald-200 mt-1">CONGO</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-slate-900 shadow">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              {/* Titre & Identité */}
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                    {org.name}
                  </h1>
                  <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                    Score : {org.transparency_score || 96}/100
                  </Badge>
                </div>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {org.description || 'Organisation non gouvernementale dédiée à l\'intérêt général, à l\'éducation et à la solidarité nationale en République du Congo.'}
                </p>

                {/* Coordonnées & Domaines */}
                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5 text-zinc-200">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {org.address ? `${org.address}, ` : ''}{org.city || 'Brazzaville'}, Congo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {org.phone || '+242 06 600 00 03'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {org.email || 'contact@espoircongo.cg'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Clés en Hero */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto shrink-0 pt-2 md:pt-0">
              <Link href={`/o/${org.slug}/don`} className="w-full">
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg gap-2 text-sm">
                  <Heart className="h-4 w-4" /> Faire un don solidaire
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCerModal(true)}
                className="w-full border-emerald-500/40 text-emerald-300 hover:bg-white/10 gap-2 text-xs"
              >
                <FileCheck className="h-4 w-4 text-emerald-400" /> Compte d'Emploi (CER 2026)
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUATRE INDICATEURS RÉGALIENS DE TRANSPARENCE */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6 -mt-6 relative z-30">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-card border-emerald-200/80 dark:border-emerald-900 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Fonds collectés</span>
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-950 dark:text-emerald-400 font-mono">
                {formatCurrency(totalRaised)} <span className="text-sm font-semibold">FCFA</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 inline" /> 100% Mobile Money certifié
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-zinc-200 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Engagés sur le terrain</span>
                <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                1 800 000 <span className="text-sm font-semibold">FCFA</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Virement UBA Congo (Tables-bancs Bacongo)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-zinc-200 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ratio Action Sociale</span>
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-900 dark:text-emerald-400 font-mono">
                82,0 %
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Alloué aux missions directes (Norme DGIFN)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-card border-zinc-200 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gouvernance Loi 1901</span>
                <div className="p-2 rounded-xl bg-purple-100 text-purple-800">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
                5 Dirigeants
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Bureau certifié Préfecture de Brazzaville
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. ONGLETS DE NAVIGATION THÉMATIQUES */}
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        <div className="flex border-b border-border bg-white dark:bg-card rounded-xl p-1 shadow-sm gap-1 overflow-x-auto">
          {[
            { id: 'campagnes', label: `Campagnes Solidaires (${campaigns.length})`, icon: Heart },
            { id: 'evenements', label: `Événements & Billets (${events.length})`, icon: Calendar },
            { id: 'transparence', label: 'Transparence & Budget Réel', icon: Shield },
            { id: 'gouvernance', label: 'Gouvernance & Dirigeants', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENU ONGLET 1 : CAMPAGNES SOLIDAIRES */}
        {activeTab === 'campagnes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Appels à la Générosité Publique en cours</h2>
                <p className="text-xs text-muted-foreground">Chaque don fait l'objet d'un reçu fiscal Loi 1901 immédiat.</p>
              </div>
              <Badge variant="outline" className="text-xs">Collectes Traçables</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c) => {
                const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) : 0;
                return (
                  <Card key={c.id} className="h-full flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow border-emerald-100">
                    {/* Thematic Header Visual */}
                    <div className="relative h-40 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between z-10">
                        <Badge className="bg-emerald-500/80 text-white text-[10px] font-bold">
                          {c.category === 'education' ? 'Éducation Populaire' : 'Action Sociale'}
                        </Badge>
                        <Badge variant="outline" className="border-white/30 text-white text-[10px] font-mono">
                          {pct}% financé
                        </Badge>
                      </div>

                      <div className="z-10">
                        <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                          Brazzaville, Congo
                        </span>
                        <h3 className="font-bold text-base leading-snug line-clamp-2 text-white">
                          {c.title}
                        </h3>
                      </div>

                      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {c.description}
                        </p>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-sm">
                              {formatCurrency(c.current_amount)} FCFA
                            </span>
                            <span className="text-muted-foreground font-mono">
                              Obj. {formatCurrency(c.goal_amount)} FCFA
                            </span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between gap-2">
                        <Link href={`/o/${org.slug}/campagnes/${c.slug}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            Voir le projet
                          </Button>
                        </Link>
                        <Link href={`/o/${org.slug}/don?campagne=${c.slug}`} className="flex-1">
                          <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1">
                            <Heart className="h-3 w-3" /> Donner
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 2 : ÉVÉNEMENTS & BILLETTERIE */}
        {activeTab === 'evenements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Événements Communautaires & Billetterie</h2>
                <p className="text-xs text-muted-foreground">Inscrivez-vous pour obtenir votre billet électronique d'accès avec QR code.</p>
              </div>
              <Badge variant="outline" className="text-xs">Émargement Numérique</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((e) => (
                <Card key={e.id} className="overflow-hidden border-zinc-200 shadow-sm flex flex-col justify-between">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-amber-50/40 dark:from-emerald-950/20 dark:to-transparent border-b pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="bg-emerald-700 text-white text-[10px]">
                        {e.registration_fee > 0 ? `${formatCurrency(e.registration_fee)} FCFA` : 'Entrée Libre & Gratuite'}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        Capacité : {e.capacity || 100} places
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold mt-2 leading-snug">
                      {e.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {e.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Date & Heure</p>
                          <p className="text-muted-foreground">{formatDate(e.start_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Lieu de rassemblement</p>
                          <p className="text-muted-foreground">{e.venue || e.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Billet numérique avec QR code
                      </span>
                      <Link href={`/o/${org.slug}/evenements/${e.slug}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5">
                          <Ticket className="h-3.5 w-3.5" /> Réserver mon billet
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 3 : TRANSPARENCE & BUDGET RÉEL */}
        {activeTab === 'transparence' && (
          <div className="space-y-6">
            {/* Bannière d'attestation de tutelle DGIFN */}
            <Card className="border-emerald-600/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      <span className="text-xs uppercase font-bold text-emerald-400">
                        CONFORMITÉ FINANCIÈRE DE LA RÉPUBLIQUE DU CONGO
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Compte d'Emploi des Ressources (CER 2026) disponible au public
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Tous les dons reçus font l'objet d'un rapprochement bancaire certifié avec la banque UBA Congo.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCerModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shrink-0 shadow"
                  >
                    <FileCheck className="h-4 w-4" /> Consulter le Rapport Officiel CER
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ventilation Budgétaire Détaillée (Projet École Bacongo) */}
            <Card className="border-zinc-200">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-700" />
                      Ventilation des Dépenses Réalisées sur le Terrain
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Projet prioritaire : Rénovation de l'école primaire de Bacongo (2 150 000 FCFA alloués).
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs font-mono">
                    82% Ratio Social Direct
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y text-xs">
                  {BUDGET_BREAKDOWN_BACONGO.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{item.category}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              item.status === 'completed'
                                ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                                : 'border-blue-500 text-blue-700 bg-blue-50'
                            }`}
                          >
                            {item.status === 'completed' ? 'Achevé & Réceptionné' : 'En cours d\'exécution'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{item.description}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Prestataire local : <strong>{item.provider}</strong> • Réf. pièce : {item.invoiceRef}
                        </p>
                      </div>

                      <div className="text-right shrink-0 sm:min-w-[160px]">
                        <p className="font-bold font-mono text-sm text-emerald-800 dark:text-emerald-400">
                          {formatCurrency(item.spentAmount)} FCFA
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          sur {formatCurrency(item.allocatedAmount)} FCFA budgétés
                        </p>
                        <Progress value={item.percentageSpent} className="h-1.5 mt-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rapprochement Bancaire UBA Congo */}
            <div className="rounded-xl border border-emerald-300/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-700" />
                  Rapprochement Bancaire UBA Congo
                </span>
                <span className="font-mono text-emerald-800 font-bold">CG023 00101 02000014820 45</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Le compte bancaire officiel de l'{org.name} auprès de UBA Congo enregistre les reversements automatiques des collectes Mobile Money (MTN MoMo & Airtel Money). Aucune sortie de fonds n'est autorisée sans double signature du Président et du Trésorier Général.
              </p>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 4 : GOUVERNANCE & DIRIGEANTS (NOUVEAU) */}
        {activeTab === 'gouvernance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Bureau Exécutif & Dirigeants Statutaires</h2>
              <p className="text-xs text-muted-foreground">
                Gouvernance démocratique déclarée en Préfecture de Brazzaville conformément à la Loi 1901.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_MEMBERS.slice(0, 5).map((m) => (
                <Card key={m.id} className="border-zinc-200 shadow-sm">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-lg flex items-center justify-center shrink-0">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div className="space-y-0.5">
                      <Badge variant="outline" className="text-[10px] border-emerald-600 text-emerald-800 bg-emerald-50 mb-1">
                        {m.membership_type === 'board' ? 'Bureau Exécutif' : 'Membre Actif'}
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">
                        {m.first_name} {m.last_name}
                      </h4>
                      <p className="text-xs text-emerald-700 font-medium">
                        {m.notes?.split('-')[0] || 'Adhérent'}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono pt-1">
                        Matricule : {m.card_number}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 5. CADRE DE CONFIANCE MOBILE MONEY & REÇU FISCAL */}
        <div className="rounded-2xl border border-zinc-200 bg-white dark:bg-card p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="font-bold text-base flex items-center justify-center md:justify-start gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Paiements 100% Sécurisés en Monnaie Nationale (FCFA)
            </h3>
            <p className="text-xs text-muted-foreground max-w-xl">
              Les libéralités financières sont collectées via MTN Mobile Money (*105#) et Airtel Money (*128#). Chaque donateur reçoit immédiatement un Reçu Fiscal certifié déductible.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-lg border bg-amber-50/60 text-amber-900 text-xs font-bold font-mono">
              MTN MoMo (*105#)
            </div>
            <div className="px-3 py-1.5 rounded-lg border bg-rose-50/60 text-rose-900 text-xs font-bold font-mono">
              Airtel Money (*128#)
            </div>
            <div className="px-3 py-1.5 rounded-lg border bg-emerald-50/60 text-emerald-900 text-xs font-bold font-mono">
              UBA Congo
            </div>
          </div>
        </div>

        {/* 6. PARTAGE & QR CODE DE CONTRÔLE */}
        <Card className="border-dashed border-2 border-emerald-300">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-base flex items-center justify-center sm:justify-start gap-2">
                <QrCode className="h-5 w-5 text-emerald-700" />
                Partagez le portail officiel de l'ONG
              </h4>
              <p className="text-xs text-muted-foreground">
                Diffusez cette page pour mobiliser la générosité publique en toute confiance et transparence.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="text-xs gap-1.5 border-emerald-600 text-emerald-800 hover:bg-emerald-50"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copiedLink ? 'Lien copié dans le presse-papier !' : 'Copier le lien public'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5 shrink-0 bg-white p-3 rounded-xl border shadow-sm">
              <QrCode className="h-20 w-20 text-zinc-900" />
              <span className="text-[9px] font-mono text-zinc-500">Scan & Don Immédiat</span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 7. PIED DE PAGE RÉGALIEN */}
      <footer className="border-t bg-white dark:bg-card py-10 mt-12 text-xs text-muted-foreground">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              CG
            </div>
            <span>
              Portail Officiel d'Intérêt Général • République du Congo • Loi du 1er Juillet 1901
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/transparence" className="hover:text-foreground">
              Régulation DGIFN
            </Link>
            <Link href="/verifier-recu" className="hover:text-foreground">
              Authentification Reçus
            </Link>
            <Link href={`/o/${org.slug}/don`} className="hover:text-foreground text-primary font-bold">
              Faire un Don
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal Compte d'Emploi des Ressources (CER 2026) */}
      <CerReportModal
        open={showCerModal}
        onOpenChange={setShowCerModal}
        organization={org}
      />
    </div>
  );
}
