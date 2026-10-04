'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Search, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, APP_NAME } from '@/lib/constants';
import type { Campaign, Organization } from '@/lib/types';

export default function CampaignsPublicPage() {
  const [campaigns, setCampaigns] = useState<(Campaign & { organization: Organization })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*, organization:organizations(*)')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (data) setCampaigns(data as (Campaign & { organization: Organization })[]);
      setLoading(false);
    })();
  }, []);

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q) || c.organization.name.toLowerCase().includes(q);
  });

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

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Campagnes de dons</h1>
        <p className="mb-6 text-muted-foreground">Soutenez les projets des associations congolaises</p>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une campagne..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            {search ? 'Aucune campagne trouvee' : 'Aucune campagne active pour le moment'}
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) : 0;
              return (
                <Link key={c.id} href={`/o/${c.organization.slug}/campagnes/${c.slug}`}>
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20" />
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">{c.organization.name}</Badge>
                      <h3 className="mb-2 font-semibold">{c.title}</h3>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-primary">{formatCurrency(c.current_amount)} F</span>
                        <span className="text-muted-foreground">/ {formatCurrency(c.goal_amount)}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" /> {pct}% atteint
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
