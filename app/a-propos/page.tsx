'use client';

import Link from 'next/link';
import { Heart, Shield, Smartphone, Users, Target, TrendingUp, CheckCircle2, ArrowRight, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

export default function AboutPage() {
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

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary">A propos d'AssoCongo</Badge>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">La plateforme gratuite des ONG au Congo</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">{APP_DESCRIPTION}</p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Heart className="mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Notre mission</h3>
              <p className="text-sm text-muted-foreground">
                Democratizer l'acces au numerique pour les ONG et associations de Republique du Congo, en offrant une plateforme gratuite, simple et transparente pour la gestion de leurs activites et la collecte de dons.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Shield className="mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">Alignement DGIFN</h3>
              <p className="text-sm text-muted-foreground">
                AssoCongo s'inscrit dans les missions de la Direction Generale des Institutions Financieres Nationales: modernisation des paiements, inclusion financiere, et tracabilite des flux.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardContent className="p-8">
            <h3 className="mb-6 text-center text-2xl font-bold">Modelle economique: 100% gratuit</h3>
            <p className="mb-6 text-center text-muted-foreground">
              Inspire du modele HelloAsso, AssoCongo est entierement gratuit pour les ONG. La plateforme est financee par les pourboires volontaires des donateurs.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">Gratuit pour les ONG</p>
                <p className="text-sm text-muted-foreground">Aucun frais d'inscription ni de transaction</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <p className="font-semibold">Pourboires volontaires</p>
                <p className="text-sm text-muted-foreground">Les donateurs choisissent librement de soutenir la plateforme</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
                  <Smartphone className="h-6 w-6 text-info" />
                </div>
                <p className="font-semibold">Mobile Money</p>
                <p className="text-sm text-muted-foreground">Orange Money, MTN MoMo, Airtel Money, Monetbil</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h3 className="mb-6 text-center text-2xl font-bold">Fonctionnalites principales</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'CRM des membres', desc: 'Gestion des adherents, cotisations, cartes numeriques' },
              { icon: Target, title: 'Campagnes de dons', desc: 'Crowdfunding, formulaires publics, pourboires' },
              { icon: Heart, title: 'Evenements & billetterie', desc: 'Inscriptions en ligne, check-in' },
              { icon: TrendingUp, title: 'Tableau de bord', desc: 'Vue financiere, exports CSV/PDF' },
              { icon: Shield, title: 'Transparence', desc: 'Journal d' + 'audit, tracabilite complete' },
              { icon: Globe, title: 'Page publique', desc: 'Vitrine, QR code, lien de don' },
            ].map((f) => (
              <Card key={f.title}>
                <CardContent className="p-5">
                  <f.icon className="mb-2 h-6 w-6 text-primary" />
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary via-emerald-800 to-emerald-950 p-8 text-center text-primary-foreground md:p-12 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Rejoignez AssoCongo</h2>
          <p className="mb-6 opacity-90">Inscrivez votre ONG gratuitement en quelques minutes</p>
          <Link href="/register">
            <Button size="lg" className="bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 shadow-md">
              Creer mon ONG <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
