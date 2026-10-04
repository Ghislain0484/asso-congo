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
import { MOCK_ORGANIZATION } from '@/lib/mock-data';
import type { Organization } from '@/lib/types';

export default function SettingsPage() {
  const { currentOrg, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Organization>>(currentOrg || MOCK_ORGANIZATION);

  useEffect(() => {
    setForm(currentOrg || MOCK_ORGANIZATION);
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

  const activeOrg = currentOrg || MOCK_ORGANIZATION;

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

        {/* Dossier Réglementaire & Homologation d'État */}
        <Card className="border-emerald-300 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
                    Tutelle Loi 1901 & DGIFN
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">CONGO-ONG-2024-019</span>
                </div>
                <CardTitle className="text-lg mt-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" /> Dossier Juridique & Agrément d'État
                </CardTitle>
                <CardDescription>
                  Pièces statutaires et immatriculations officielles requises par le Ministère de l'Intérieur et le Ministère des Finances.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-600 text-emerald-800 bg-emerald-50 text-xs py-1 px-2.5 font-bold shrink-0">
                HOMOLOGATION : ACTIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Récépissé de Déclaration Préfectorale</Label>
                <Input
                  id="registration_number"
                  value={form.registration_number || 'REC-BZV-2024-N048'}
                  onChange={(e) => setForm((p) => ({ ...p, registration_number: e.target.value }))}
                  className="font-mono bg-background"
                />
                <p className="text-[11px] text-muted-foreground">Délivré par la Préfecture du Département de Brazzaville / DGAELP.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="niu_number">Numéro d'Identification Unique (NIU Fiscale)</Label>
                <Input
                  id="niu_number"
                  defaultValue="M08241100049281X"
                  className="font-mono bg-background"
                />
                <p className="text-[11px] text-muted-foreground">Direction Générale des Impôts et des Domaines (DGID).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jorc_ref">Publication au Journal Officiel (JORC)</Label>
                <Input
                  id="jorc_ref"
                  defaultValue="N° 07 du 15 Février 2024, Page 142"
                  className="bg-background"
                />
                <p className="text-[11px] text-muted-foreground">Publication légale de constitution de l'association.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_ref">Compte Bancaire Déclaré (Reversement Payout)</Label>
                <Input
                  id="bank_ref"
                  defaultValue="UBA Congo • CG023 00101 02000014820 45"
                  className="font-mono bg-background"
                />
                <p className="text-[11px] text-muted-foreground">Compte séquestre associatif pour virements certifiés DGIFN.</p>
              </div>
            </div>

            {/* Bureau Exécutif certifié */}
            <div className="rounded-lg border bg-background p-3.5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" /> Bureau Exécutif Déclaré en Préfecture (Mandat 2024-2026)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-muted/40 p-2 rounded">
                  <p className="font-semibold text-foreground">Président :</p>
                  <p className="text-muted-foreground">Marien Ngouabi</p>
                  <p className="text-[10px] font-mono text-zinc-500">CNIB: CG-BZV-1978-004128</p>
                </div>
                <div className="bg-muted/40 p-2 rounded">
                  <p className="font-semibold text-foreground">Secrétaire Générale :</p>
                  <p className="text-muted-foreground">Carine Massamba</p>
                  <p className="text-[10px] font-mono text-zinc-500">CNIB: CG-BZV-1984-009184</p>
                </div>
                <div className="bg-muted/40 p-2 rounded">
                  <p className="font-semibold text-foreground">Trésorier Général :</p>
                  <p className="text-muted-foreground">Sylvain Batéké</p>
                  <p className="text-[10px] font-mono text-zinc-500">CNIB: CG-BZV-1982-005612</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-xs">
              <div>
                <p className="font-semibold text-foreground">Score de Transparence Républicaine</p>
                <p className="text-muted-foreground">Calculé sur la complétude des justificatifs fiscaux et bancaires</p>
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                {activeOrg.transparency_score}/100 • EXCELLENT
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Page publique</p>
              <p className="text-xs text-muted-foreground">/o/{activeOrg.slug}</p>
            </div>
          </div>
          <a href={`/o/${activeOrg.slug}`} target="_blank" rel="noopener noreferrer">
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
