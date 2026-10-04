'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Shield, TrendingUp, Receipt, CheckCircle2, Globe, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, APP_NAME } from '@/lib/constants';

export default function TransparencePage() {
  const [stats, setStats] = useState({ totalRaised: 0, totalDonations: 0, totalOrgs: 0, totalTips: 0 });

  useEffect(() => {
    (async () => {
      const [donRes, tipRes, orgRes] = await Promise.all([
        supabase.from('donations').select('amount').eq('status', 'completed').is('deleted_at', null),
        supabase.from('tips').select('amount').eq('status', 'completed'),
        supabase.from('organizations').select('id').eq('status', 'active').is('deleted_at', null),
      ]);
      setStats({
        totalRaised: (donRes.data || []).reduce((s: number, d: { amount: number }) => s + d.amount, 0),
        totalDonations: donRes.data?.length || 0,
        totalOrgs: orgRes.data?.length || 0,
        totalTips: (tipRes.data || []).reduce((s: number, t: { amount: number }) => s + t.amount, 0),
      });
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-primary">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
            <Link href="/register"><Button size="sm">Creer une ONG</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary"><Shield className="mr-1 h-3 w-3" /> Transparence & DGIFN</Badge>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">Transparence de la plateforme</h1>
          <p className="text-muted-foreground">AssoCongo s'engage pour une tracabilite complete des flux financiers</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card><CardContent className="p-5 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRaised)} F</p>
            <p className="text-xs text-muted-foreground">Total collecte</p>
          </CardContent></Card>
          <Card><CardContent className="p-5 text-center">
            <Receipt className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold">{stats.totalDonations}</p>
            <p className="text-xs text-muted-foreground">Dons traites</p>
          </CardContent></Card>
          <Card><CardContent className="p-5 text-center">
            <Heart className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold">{formatCurrency(stats.totalTips)} F</p>
            <p className="text-xs text-muted-foreground">Pourboires recoltes</p>
          </CardContent></Card>
          <Card><CardContent className="p-5 text-center">
            <Globe className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold">{stats.totalOrgs}</p>
            <p className="text-xs text-muted-foreground">ONG inscrites</p>
          </CardContent></Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-primary" /> Engagements de transparence</CardTitle>
            <CardDescription>Alignes sur les missions de la DGIFN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Receipt, title: 'Tracabilite des transactions', desc: 'Chaque transaction enregistre: montant, reference operateur, statut, horodatage, ONG et donateur.' },
              { icon: Shield, title: 'Journal d\'audit complet', desc: 'Toutes les actions sensibles sont tracees dans un journal d\'audit immutable.' },
              { icon: CheckCircle2, title: 'Reus automatiques', desc: 'Chaque don genere automatiquement un recu avec reference unique.' },
              { icon: TrendingUp, title: 'Indicateurs publics', desc: 'Chaque ONG affiche publiquement ses indicateurs de transparence.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conformite reglementaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'Modernisation et securisation des moyens de paiement',
              'Developpement des services financiers numeriques',
              'Promotion de l\'inclusion financiere',
              'Tracabilite et transparence des flux financiers',
              'Architecture prete pour la conformite COBAC',
              'Paiements via prestataires agreees par la DGIFN',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/register">
            <Button size="lg">Creer votre ONG <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
