'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, Plus, Search, Download, Upload, Trash2, MoreVertical, Mail, Phone, CreditCard, CheckCircle2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MembershipCardModal } from '@/components/membership-card-modal';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, STATUS_LABELS, ROLE_LABELS, generateMemberCardNumber, slugify } from '@/lib/constants';
import { MOCK_MEMBERS } from '@/lib/mock-data';
import type { Member, MembershipType } from '@/lib/types';

export default function MembersPage() {
  const { currentOrg, demoPersona } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipType, setMembershipType] = useState<MembershipType>('member');
  const [membershipFee, setMembershipFee] = useState(0);

  const loadMembers = async () => {
    if (!currentOrg) {
      setMembers(MOCK_MEMBERS);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setMembers(data as Member[]);
    } else {
      setMembers(MOCK_MEMBERS);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
  }, [currentOrg]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    const { data, error } = await supabase
      .from('members')
      .insert({
        organization_id: currentOrg.id,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        membership_type: membershipType,
        membership_fee: membershipFee,
        card_number: generateMemberCardNumber(),
      })
      .select()
      .single();
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Membre ajoute', description: `${firstName} ${lastName} a ete ajoute` });
      setMembers((prev) => [data as Member, ...prev]);
      setDialogOpen(false);
      setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setMembershipFee(0);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('members').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast({ title: 'Membre supprime' });
    }
  };

  const exportCSV = () => {
    const headers = ['Prenom', 'Nom', 'Email', 'Telephone', 'Type', 'Statut', 'Cotisation', 'Carte'];
    const rows = members.map((m) => [m.first_name, m.last_name, m.email || '', m.phone || '', m.membership_type, m.membership_status, m.membership_fee, m.card_number || '']);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membres-${slugify(currentOrg?.name || 'ong')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOrg) return;
    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim());
    const parsed: Omit<Member, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'membership_start'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        parsed.push({
          organization_id: currentOrg.id,
          first_name: cols[0],
          last_name: cols[1],
          email: cols[2] || null,
          phone: cols[3] || null,
          membership_type: (cols[4] as MembershipType) || 'member',
          membership_fee: parseInt(cols[6]) || 0,
          membership_status: 'active',
          membership_end: null,
          birth_date: null,
          gender: null,
          address: null,
          city: null,
          province: null,
          card_number: generateMemberCardNumber(),
          notes: null,
        } as Omit<Member, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'membership_start'>);
      }
    }
    if (parsed.length === 0) {
      toast({ title: 'Erreur', description: 'Aucun membre valide trouve dans le fichier', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase.from('members').insert(parsed).select();
    if (error) {
      toast({ title: 'Erreur import', description: error.message, variant: 'destructive' });
    } else {
      setMembers((prev) => [...(data as Member[]), ...prev]);
      toast({ title: 'Import reussi', description: `${parsed.length} membres importes` });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return m.first_name.toLowerCase().includes(q) || m.last_name.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.phone || '').includes(q);
  });

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Bannière Adhérent (Grace Moukassa) */}
      {demoPersona === 'adherent' && (
        <Card className="border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 text-white shadow-md">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-lg shrink-0">
                GM
              </div>
              <div>
                <p className="text-xs uppercase text-emerald-400 font-bold">Votre Carte Numérique 2026</p>
                <h3 className="text-base font-bold text-white">Grace Moukassa • Adhérente Active</h3>
                <p className="text-xs text-zinc-300">Matricule : CG-BZV-2026-00101 • Cotisation à jour (10 000 FCFA acquittés)</p>
              </div>
            </div>
            <Button
              onClick={() => {
                const gm = members.find((m) => m.email === 'adherent@espoircongo.cg') || members[0];
                setSelectedMember(gm);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-2 shrink-0"
            >
              <CreditCard className="h-4 w-4" /> Afficher & Imprimer ma Carte
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bannière Régulateur (DGIFN) */}
      {demoPersona === 'regulator' && (
        <div className="rounded-xl border border-emerald-600/40 bg-emerald-50/50 p-4 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Registre Statutory des Membres & Dirigeants</strong> • Conforme aux exigences de déclaration préfectorale de la Loi 1901.
            </span>
          </div>
          <Badge variant="outline" className="border-emerald-700 text-emerald-800 bg-white font-medium shrink-0">
            Contrôle DGIFN Certifié
          </Badge>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Membres & CRM</h1>
          <p className="text-muted-foreground">{members.length} membres répertoriés</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Importer
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={members.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exporter
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un membre</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prenom</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'adhesion</Label>
                    <select id="type" value={membershipType} onChange={(e) => setMembershipType(e.target.value as MembershipType)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="member">Membre</option>
                      <option value="volunteer">Benevole</option>
                      <option value="board">Bureau</option>
                      <option value="honorary">Honoraire</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">Cotisation (FCFA)</Label>
                    <Input id="fee" type="number" value={membershipFee} onChange={(e) => setMembershipFee(parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Ajouter le membre</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un membre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Members list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">{search ? 'Aucun membre trouve' : 'Aucun membre pour le moment'}</p>
            {!search && <p className="mt-1 text-sm text-muted-foreground">Ajoutez votre premier membre ou importez un fichier CSV</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Card key={m.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div>
                      <h4 className="font-medium">{m.first_name} {m.last_name}</h4>
                      <Badge variant="outline" className="mt-0.5 text-xs">{ROLE_LABELS[m.membership_type]}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDelete(m.id)} className="text-destructive cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {m.email && <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {m.email}</p>}
                  {m.phone && <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {m.phone}</p>}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-mono text-zinc-600 bg-muted px-1.5 py-0.5 rounded">N° {m.card_number}</span>
                    <span className="font-medium text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 inline text-emerald-600" /> Cotisation à jour
                    </span>
                  </div>
                  {m.membership_fee > 0 && <p className="text-xs text-muted-foreground">Annuelle : {formatCurrency(m.membership_fee)} FCFA</p>}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMember(m)}
                  className="w-full mt-3 text-xs text-emerald-800 border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <CreditCard className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Voir Carte Officielle 2026
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Carte de Membre */}
      <MembershipCardModal
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        member={selectedMember}
        organization={currentOrg}
      />
    </div>
  );
}
