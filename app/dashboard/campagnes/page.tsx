'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, slugify, STATUS_LABELS } from '@/lib/constants';
import type { Campaign } from '@/lib/types';

export default function CampaignsPage() {
  const { currentOrg } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState(500000);
  const [category, setCategory] = useState('general');
  const [endDate, setEndDate] = useState('');

  const loadCampaigns = async () => {
    if (!currentOrg) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data as Campaign[]);
    setLoading(false);
  };

  useEffect(() => { loadCampaigns(); }, [currentOrg]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    let slug = slugify(title);
    const { data: existing } = await supabase
      .from('campaigns')
      .select('id')
      .eq('organization_id', currentOrg.id)
      .eq('slug', slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        organization_id: currentOrg.id,
        title,
        slug,
        description: description || null,
        goal_amount: goalAmount,
        category,
        status: 'active',
        end_date: endDate || null,
      })
      .select()
      .single();
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Campagne creee', description: `"${title}" est maintenant en ligne` });
      setCampaigns((prev) => [data as Campaign, ...prev]);
      setDialogOpen(false);
      setTitle(''); setDescription(''); setGoalAmount(500000); setEndDate('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campagnes</h1>
          <p className="text-muted-foreground">{campaigns.length} campagnes au total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nouvelle campagne</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creer une campagne</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la campagne</Label>
                <Input id="title" placeholder="Soutenez nos projets d'education" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" placeholder="Decrivez votre campagne..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Objectif (FCFA)</Label>
                  <Input id="goal" type="number" value={goalAmount} onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categorie</Label>
                  <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="general">General</option>
                    <option value="education">Education</option>
                    <option value="sante">Sante</option>
                    <option value="humanitaire">Humanitaire</option>
                    <option value="environnement">Environnement</option>
                    <option value="urgence">Urgence</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin (optionnel)</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <DialogFooter>
                <Button type="submit">Creer la campagne</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucune campagne pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">Creez votre premiere campagne de dons</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) : 0;
            return (
              <Link key={c.id} href={`/dashboard/campagnes/${c.id}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline">{c.category}</Badge>
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{STATUS_LABELS[c.status]}</Badge>
                    </div>
                    <h3 className="mb-3 font-semibold">{c.title}</h3>
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
  );
}
