'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Heart, Receipt, Share2, Hammer, CheckCircle2, FileText, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReceiptModal } from '@/components/receipt-modal';
import { CerReportModal } from '@/components/cer-report-modal';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDate, timeAgo, STATUS_LABELS, PROVIDER_LABELS } from '@/lib/constants';
import { MOCK_CAMPAIGNS, MOCK_DONATIONS, BUDGET_BREAKDOWN_BACONGO } from '@/lib/mock-data';
import type { Campaign, Donation, Transaction } from '@/lib/types';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { currentOrg } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCerModal, setShowCerModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: camp } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();
      if (camp) {
        setCampaign(camp as Campaign);
      } else {
        const fallbackCamp = MOCK_CAMPAIGNS.find((c) => c.id === id || c.slug === id) || MOCK_CAMPAIGNS[0];
        setCampaign(fallbackCamp);
      }

      const { data: dons } = await supabase
        .from('donations')
        .select('*')
        .eq('campaign_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (dons && dons.length > 0) {
        setDonations(dons as Donation[]);
      } else {
        const fallbackDons = MOCK_DONATIONS.filter((d) => d.campaign_id === id);
        setDonations(fallbackDons.length > 0 ? fallbackDons : MOCK_DONATIONS.slice(0, 5));
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/dashboard/campagnes">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux campagnes</Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCerModal(true)}
          className="gap-1.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 text-xs font-semibold"
        >
          <FileText className="h-4 w-4" /> Compte d'Emploi des Ressources (CER 2026)
        </Button>
      </div>

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

          {/* Ventilation Budgétaire Certifiée DGIFN */}
          <Card className="border-emerald-600/30">
            <CardHeader className="bg-emerald-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-950">
                    <Hammer className="h-5 w-5 text-emerald-600" />
                    Ventilation Budgétaire & Affectation des Fonds
                  </CardTitle>
                  <CardDescription>
                    Suivi analytique des dépenses et artisans locaux certifié conforme aux normes DGIFN
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-600 text-emerald-800 bg-white font-mono text-xs">
                  5 Postes Budgétaires
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Budget Total Cible</p>
                  <p className="font-bold text-base text-zinc-900">{formatCurrency(campaign.goal_amount)} FCFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Engagé / Dépensé</p>
                  <p className="font-bold text-base text-emerald-700">{formatCurrency(campaign.current_amount)} FCFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reste à Financer</p>
                  <p className="font-bold text-base text-warning">
                    {formatCurrency(Math.max(0, campaign.goal_amount - campaign.current_amount))} FCFA
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {BUDGET_BREAKDOWN_BACONGO.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3.5 bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h5 className="font-semibold text-sm text-zinc-900">{item.category}</h5>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      <Badge variant={item.status === 'completed' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'} className="text-[10px] shrink-0 ml-2">
                        {item.status === 'completed' ? 'Terminé' : item.status === 'in_progress' ? 'En cours' : 'Prévu'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium my-1.5">
                      <span className="text-emerald-700">{formatCurrency(item.spentAmount)} FCFA engagés</span>
                      <span className="text-muted-foreground">sur {formatCurrency(item.allocatedAmount)} FCFA</span>
                    </div>
                    <Progress value={item.percentageSpent} className="h-1.5" />

                    <div className="mt-2 pt-2 border-t flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
                      <span>Artisan / Fournisseur : <strong className="text-zinc-800">{item.provider}</strong></span>
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">Bon de commande : {item.invoiceRef}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                    <div key={d.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Heart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {d.donor_is_anonymous ? 'Donateur anonyme' : d.donor_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {timeAgo(d.created_at)} • {d.payment_provider === 'mtn_momo' ? 'MTN MoMo' : d.payment_provider === 'airtel_money' ? 'Airtel Money' : 'Espèces'}
                          </p>
                          {d.message && <p className="text-xs text-zinc-600 italic mt-0.5">"{d.message}"</p>}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-bold text-primary">{formatCurrency(d.amount)} F</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                          onClick={() => {
                            setSelectedTx({
                              id: d.id,
                              organization_id: d.organization_id,
                              donation_id: d.id,
                              event_registration_id: null,
                              type: 'donation',
                              amount: d.amount,
                              currency: d.currency,
                              status: 'success',
                              provider: (d.payment_provider as any) || 'mtn_momo',
                              provider_reference: d.receipt_number || 'REC-DGIFN-2026-004812',
                              provider_transaction_id: d.receipt_number,
                              provider_phone: d.donor_phone,
                              description: `Don pour ${campaign.title} (${d.donor_name})`,
                              metadata: {},
                              processed_at: d.created_at,
                              deleted_at: null,
                              created_at: d.created_at,
                              updated_at: d.updated_at,
                            });
                          }}
                        >
                          <FileText className="mr-1 h-3 w-3" /> Reçu Fiscal
                        </Button>
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

      {/* Modal Reçu Fiscal */}
      <ReceiptModal
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        transaction={selectedTx}
        organization={currentOrg}
      />

      {/* Modal Compte d'Emploi des Ressources (CER 2026) */}
      <CerReportModal
        open={showCerModal}
        onOpenChange={setShowCerModal}
        organization={currentOrg}
      />
    </div>
  );
}
