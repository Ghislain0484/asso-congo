'use client';

import { useEffect, useState } from 'react';
import { Save, Shield, Globe, Building2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { PROVINCES_CONGO, DOMAINS_INTERVENTION } from '@/lib/constants';
import type { Organization } from '@/lib/types';

export default function SettingsPage() {
  const { currentOrg, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Organization>>({});

  useEffect(() => {
    if (currentOrg) setForm(currentOrg);
  }, [currentOrg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setSaving(true);
    const { error } = await supabase
      .from('organizations')
      .update({
        name: form.name,
        acronym: form.acronym,
        description: form.description,
        province: form.province,
        city: form.city,
        address: form.address,
        phone: form.phone,
        email: form.email,
        website: form.website,
        domains: form.domains || [],
      })
      .eq('id', currentOrg.id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Parametres sauvegardes' });
      refreshProfile();
    }
    setSaving(false);
  };

  const toggleDomain = (d: string) => {
    const current = form.domains || [];
    setForm((prev) => ({ ...prev, domains: current.includes(d) ? current.filter((x) => x !== d) : [...current, d] }));
  };

  if (!currentOrg) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parametres</h1>
        <p className="text-muted-foreground">Configurez le profil de votre ONG</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Informations generales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'ONG</Label>
                <Input id="name" value={form.name || ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acronym">Sigle</Label>
                <Input id="acronym" value={form.acronym || ''} onChange={(e) => setForm((p) => ({ ...p, acronym: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <select id="province" value={form.province || 'Brazzaville'} onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {PROVINCES_CONGO.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={form.city || ''} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={form.address || ''} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input id="phone" value={form.phone || ''} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email || ''} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input id="website" value={form.website || ''} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Domaines d'intervention</CardTitle>
            <CardDescription>Selectionnez les domaines d'action de votre ONG</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DOMAINS_INTERVENTION.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDomain(d)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    (form.domains || []).includes(d)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Transparence & Conformite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Statut de verification</p>
                <p className="text-xs text-muted-foreground">ONG verifiee par AssoCongo</p>
              </div>
              <Badge variant={currentOrg.is_verified ? 'default' : 'secondary'}>
                {currentOrg.is_verified ? 'Verifiee' : 'En attente'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Score de transparence</p>
                <p className="text-xs text-muted-foreground">Alignement DGIFN</p>
              </div>
              <Badge variant="outline" className="text-primary">{currentOrg.transparency_score}/100</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Page publique</p>
              <p className="text-xs text-muted-foreground">/o/{currentOrg.slug}</p>
            </div>
          </div>
          <a href={`/o/${currentOrg.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Voir la page</Button>
          </a>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>
    </div>
  );
}
