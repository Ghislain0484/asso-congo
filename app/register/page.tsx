'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, User as UserIcon, Phone, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { slugify, PROVINCES_CONGO, DOMAINS_INTERVENTION } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // User fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Org fields
  const [orgName, setOrgName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [province, setProvince] = useState('Brazzaville');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [domains, setDomains] = useState<string[]>([]);

  const toggleDomain = (d: string) => {
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Erreur lors de la creation du compte');

      const slug = slugify(orgName);
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          acronym: acronym || null,
          slug,
          province,
          city: city || null,
          description: description || null,
          domains,
          status: 'active',
          is_verified: false,
          email,
          phone,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: memberError } = await supabase.from('organization_members').insert({
        organization_id: orgData.id,
        user_id: data.user.id,
        role: 'admin',
      });

      if (memberError) throw memberError;

      toast({ title: 'Compte cree', description: 'Votre ONG est en ligne. Bienvenue sur AssoCongo !' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-8">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour a l'accueil
        </Link>
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Creer votre ONG</CardTitle>
            <CardDescription>
              Etape {step}/2 — {step === 1 ? 'Vos informations' : 'Informations de l\'ONG'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form
                onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="vous@exemple.cg" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+242 06 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Min. 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Continuer</Button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nom de l'ONG</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="orgName" placeholder="Association Espoir Congo" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acronym">Sigle (optionnel)</Label>
                    <Input id="acronym" placeholder="AEC" value={acronym} onChange={(e) => setAcronym(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Département</Label>
                    <select
                      id="province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {PROVINCES_CONGO.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" placeholder="Brazzaville" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <textarea
                    id="description"
                    placeholder="Decrivez la mission de votre ONG..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Domaines d'intervention</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS_INTERVENTION.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDomain(d)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          domains.includes(d)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Retour</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creation...' : 'Creer mon ONG'}
                  </Button>
                </div>
              </form>
            )}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Deja un compte ?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
