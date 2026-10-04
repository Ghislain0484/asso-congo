'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, TrendingUp, MapPin, Calendar, Clock, Users, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatDate, timeAgo, STATUS_LABELS } from '@/lib/constants';
import type { Campaign, Organization, Donation } from '@/lib/types';

export default function PublicCampaignDetailPage() {
  const { slug, campslug } = useParams();
  const [org, setOrg] = useState<Organization | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !campslug) return;
    (async () => {
      const { data: orgData } = await supabase.from('organizations').select('*').eq('slug', slug).maybeSingle();
      if (!orgData) { setLoading(false); return; }
      setOrg(orgData as Organization);
      const { data: campData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', orgData.id)
        .eq('slug', campslug)
        .maybeSingle();
      if (campData) {
        setCampaign(campData as Campaign);
        const { data: dons } = await supabase
          .from('donations')
          .select('*')
          .eq('campaign_id', campData.id)
          .eq('status', 'completed')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
        if (dons) setDonations(dons as Donation[]);
      }
      setLoading(false);
    })();
  }, [slug, campslug]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!org || !campaign) {
    return <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Campagne introuvable</h1>
      <Link href={`/o/${slug}`}><Button className="mt-4">Voir l'ONG</Button></Link>
    </div>;
  }

  const pct = campaign.goal_amount > 0 ? Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100)) : 0;
  const completedDonations = donations;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/o/${org.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> {org.name}
          </Link>
      </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="mt-2">{STATUS_LABELS[campaign.status]}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {campaign.description && <p className="text-muted-foreground">{campaign.description}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Dons recents ({completedDonations.length})</CardTitle></CardHeader>
              <CardContent>
                {completedDonations.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Soyez le premier a donner !</p>
                ) : (
                  <div className="space-y-2">
                    {completedDonations.map((d) => (
                      <div key={d.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <Heart className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{d.donor_is_anonymous ? 'Anonyme' : d.donor_name}</p>
                            <p className="text-xs text-muted-foreground">{timeAgo(d.created_at)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-primary">{formatCurrency(d.amount)} F</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardContent className="p-5">
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-primary">{formatCurrency(campaign.current_amount)} F</span>
                    <span className="text-muted-foreground">/ {formatCurrency(campaign.goal_amount)}</span>
                  </div>
                  <Progress value={pct} className="h-3" />
                  <p className="mt-2 text-center text-2xl font-bold text-primary">{pct}%</p>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xl font-bold">{completedDonations.length}</p>
                    <p className="text-xs text-muted-foreground">Dons</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xl font-bold">{formatCurrency(campaign.goal_amount - campaign.current_amount)}</p>
                    <p className="text-xs text-muted-foreground">Restant F</p>
                  </div>
                </div>
                <Link href={`/o/${org.slug}/don`}>
                  <Button size="lg" className="w-full"><Heart className="mr-2 h-4 w-4" /> Faire un don</Button>
                </Link>
                {campaign.end_date && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Se termine le {formatDate(campaign.end_date)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
