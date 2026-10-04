'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Heart,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Globe,
  Building2,
  Receipt,
  QrCode,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION, formatCurrency } from '@/lib/constants';
import { supabase } from '@/lib/supabase-client';
import type { Organization, Campaign } from '@/lib/types';

export default function HomePage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [campaigns, setCampaigns] = useState<(Campaign & { organization: Organization })[]>([]);

  useEffect(() => {
    (async () => {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(6);
      if (orgData) setOrgs(orgData as Organization[]);

      const { data: campData } = await supabase
        .from('campaigns')
        .select('*, organization:organizations(*)')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(3);
      if (campData) setCampaigns(campData as (Campaign & { organization: Organization })[]);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/associations" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Associations
            </Link>
            <Link href="/campagnes" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Campagnes
            </Link>
            <Link href="/transparence" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Transparence
            </Link>
            <Link href="/verifier-recu" className="text-sm font-medium text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Vérifier un Reçu
            </Link>
            <Link href="/a-propos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              À propos
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Créer une ONG</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Ruban Républicain Vert-Jaune-Rouge */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-[#009543]"></div>
        <div className="w-1/3 bg-[#FBDE4A]"></div>
        <div className="w-1/3 bg-[#DC241F]"></div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="animate-slide-up">
              <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300">
                <Shield className="mr-1 h-3.5 w-3.5" /> Tutelle Loi 1901 • Surveillance Fiscale DGIFN • République du Congo
              </Badge>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
                La plateforme <span className="text-primary">100% gratuite</span> de gestion des ONG au Congo
              </h1>
              <p className="mb-8 text-lg text-muted-foreground text-balance">
                {APP_DESCRIPTION}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Creer une ONG <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/associations">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Decouvrir les associations
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Gratuit pour les ONG
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Mobile Money integre
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> 100% transparent
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <Card className="overflow-hidden border-primary/20 shadow-xl">
                <div className="bg-gradient-to-br from-primary via-emerald-800 to-emerald-950 p-6 text-primary-foreground">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Total collecte en 2026</p>
                      <p className="text-2xl font-bold">{formatCurrency(45_680_000)} FCFA</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-white/10 p-3 text-center">
                      <p className="text-xl font-bold">127</p>
                      <p className="text-xs opacity-80">ONG inscrites</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-3 text-center">
                      <p className="text-xl font-bold">3 400</p>
                      <p className="text-xs opacity-80">Dons</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-3 text-center">
                      <p className="text-xl font-bold">98%</p>
                      <p className="text-xs opacity-80">Taux succes</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Smartphone className="h-4 w-4" /> Orange Money
                      </span>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-600">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Smartphone className="h-4 w-4" /> MTN MoMo
                      </span>
                      <Badge variant="secondary" className="bg-yellow-50 text-yellow-600">Actif</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Smartphone className="h-4 w-4" /> Airtel Money
                      </span>
                      <Badge variant="secondary" className="bg-red-50 text-red-600">Actif</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Tout ce dont votre ONG a besoin</h2>
            <p className="text-lg text-muted-foreground">Une plateforme complete, simple et gratuite</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Gestion des membres', desc: 'CRM leger, cotisations, cartes de membre numeriques, import/export CSV.' },
              { icon: Heart, title: 'Collecte de dons', desc: 'Campagnes de crowdfunding, formulaires publics, pourboires volontaires.' },
              { icon: Calendar, title: 'Evenements & billetterie', desc: 'Creation d\'evenements, inscriptions, check-in, billetterie en ligne.' },
              { icon: TrendingUp, title: 'Tableau de bord', desc: 'Vue financiere claire, historique des transactions, exports CSV/PDF.' },
              { icon: Shield, title: 'Transparence DGIFN', desc: 'Journal d\'audit, tracabilite complete, indicateurs de transparence.' },
              { icon: QrCode, title: 'Page publique & QR Code', desc: 'Vitrine personnalisable, lien de don, QR code pour partager.' },
            ].map((f, i) => (
              <Card key={i} className="animate-slide-up border-border/50 transition-shadow hover:shadow-lg" style={{ animationDelay: `${i * 80}ms` }}>
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-3 text-3xl font-bold">Campagnes en cours</h2>
                <p className="text-muted-foreground">Soutenez les projets des associations congolaises</p>
              </div>
              <Link href="/campagnes">
                <Button variant="outline">Voir tout <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {campaigns.map((c) => {
                const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) : 0;
                return (
                  <Link key={c.id} href={`/o/${c.organization.slug}/campagnes/${c.slug}`}>
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20" />
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{c.organization.name}</Badge>
                        <h3 className="mb-2 font-semibold">{c.title}</h3>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-bold text-primary">{formatCurrency(c.current_amount)} FCFA</span>
                          <span className="text-muted-foreground">sur {formatCurrency(c.goal_amount)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{pct}% atteint</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Comment ca marche ?</h2>
            <p className="text-lg text-muted-foreground">Inscription en 3 etapes, gratuit pour toujours</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Creez votre compte', desc: 'Inscrivez-vous en quelques minutes avec votre email. Creez le profil de votre ONG.' },
              { step: '2', title: 'Configurez vos outils', desc: 'Lancez vos campagnes de dons, evenements, et geerez vos membres en un clic.' },
              { step: '3', title: 'Collectez en transparence', desc: 'Recevez les dons via Mobile Money. Chaque transaction est tracee et transparente.' },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DGIFN alignment */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-primary/20">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <Badge className="mb-4 bg-primary/10 text-primary">Alignement reglementaire</Badge>
                <h2 className="mb-4 text-3xl font-bold">Conforme aux missions de la DGIFN</h2>
                <p className="mb-6 text-muted-foreground">
                  AssoCongo s'aligne explicitement avec les objectifs de la Direction Generale des Institutions Financieres Nationales :
                </p>
                <ul className="space-y-3">
                  {[
                    'Modernisation et securisation des moyens de paiement',
                    'Developpement des services financiers numeriques',
                    'Promotion de l\'inclusion financiere',
                    'Tracabilite et transparence des flux financiers',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary to-secondary p-8 md:p-12 text-primary-foreground">
                <Globe className="mb-4 h-12 w-12 opacity-80" />
                <h3 className="mb-2 text-2xl font-bold">Pret pour la conformite COBAC</h3>
                <p className="mb-6 opacity-90">
                  Architecture de paiement abstraite, journal d'audit complet, et structure regulation-ready pour les futures exigences reglementaires.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white/10 p-4">
                    <Receipt className="mb-2 h-6 w-6" />
                    <p className="text-sm font-semibold">Reus auto</p>
                    <p className="text-xs opacity-80">Generes pour chaque don</p>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4">
                    <Shield className="mb-2 h-6 w-6" />
                    <p className="text-sm font-semibold">Audit trail</p>
                    <p className="text-xs opacity-80">Tracabilite complete</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 text-center text-primary-foreground md:p-16">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Lancez votre ONG en ligne aujourd'hui</h2>
            <p className="mb-8 text-lg opacity-90">100% gratuit. Financee par pourboires volontaires des donateurs.</p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Creer mon ONG <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold text-primary">{APP_NAME}</span>
              </div>
              <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Plateforme</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/associations">Associations</Link></li>
                <li><Link href="/campagnes">Campagnes</Link></li>
                <li><Link href="/evenements">Evenements</Link></li>
                <li><Link href="/transparence">Transparence</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Ressources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/a-propos">A propos</Link></li>
                <li><Link href="/register">Creer une ONG</Link></li>
                <li><Link href="/login">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Alignement DGIFN</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mobile Money agrege</li>
                <li>Tracabilite des transactions</li>
                <li>Inclusion financiere</li>
                <li>Conformite COBAC ready</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>(c) 2026 AssoCongo. Republique du Congo. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
