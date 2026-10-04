'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Heart, Receipt, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, timeAgo, STATUS_LABELS, PROVIDER_LABELS } from '@/lib/constants';
import type { Campaign, Donation } from '@/lib/types';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { currentOrg } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: camp } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();
      if (camp) setCampaign(camp as Campaign);
      const { data: dons } = await supabase
        .from('donations')
        .select('*')
        .eq('campaign_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (dons) setDonations(dons as Donation[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!campaign) {
    return <div className="py-20 text-center text-muted-foreground">Campagne introuvable</div>;
  }

  const pct = campaign.goal_amount > 0 ? Math.min(100, Math.round((campaign.current_amount / campaign.goal_amount) * 100)) : 0;
  const totalDonations = donations.filter((d) => d.status === 'completed');
  const totalTips = totalDonations.reduce((s, d) => s + d.tip_amount, 0);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/campagnes">
        <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux campagnes</Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="mt-2">
                    {STATUS_LABELS[campaign.status]}
                  </Badge>
                </div>
                {currentOrg && (
                  <Link href={`/o/${currentOrg.slug}/campagnes/${campaign.slug}`} target="_blank">
                    <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Partager</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {campaign.description && <p className="text-muted-foreground">{campaign.description}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dons recents ({totalDonations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {totalDonations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucun don pour le moment</p>
              ) : (
                <div className="space-y-2">
                  {totalDonations.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Heart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {d.donor_is_anonymous ? 'Donateur anonyme' : d.donor_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo(d.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{formatCurrency(d.amount)} F</p>
                        {d.tip_amount > 0 && <p className="text-xs text-muted-foreground">+{formatCurrency(d.tip_amount)} pourboire</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-primary">{formatCurrencyWithSymbol(campaign.current_amount)}</span>
                  <span className="text-muted-foreground">/ {formatCurrency(campaign.goal_amount)}</span>
                </div>
                <Progress value={pct} className="h-3" />
                <p className="mt-2 text-center text-lg font-bold text-primary">{pct}%</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xl font-bold">{totalDonations.length}</p>
                  <p className="text-xs text-muted-foreground">Dons</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xl font-bold">{formatCurrency(totalTips)}</p>
                  <p className="text-xs text-muted-foreground">Pourboires F</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {campaign.end_date && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Date de fin</p>
                <p className="font-semibold">{formatDate(campaign.end_date)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
