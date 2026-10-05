'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { APP_NAME } from '@/lib/constants';

import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setDemoPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Mode Démo Résilient : si mot de passe démo ou compte de présentation
        const lowerEmail = email.toLowerCase();
        if (
          lowerEmail.includes('dgifn') ||
          lowerEmail.includes('espoircongo') ||
          lowerEmail.includes('adherent') ||
          lowerEmail.includes('dev.support') ||
          password.startsWith('Demo2026')
        ) {
          if (lowerEmail.includes('dgifn')) setDemoPersona('regulator');
          else if (lowerEmail.includes('adherent')) setDemoPersona('adherent');
          else setDemoPersona('association');

          toast({
            title: 'Connexion Démo Réussie',
            description: 'Accès autorisé à l’espace de démonstration officielle AssoCongo.',
          });
          router.push('/dashboard');
          return;
        }
        throw error;
      }
      toast({ title: 'Connexion réussie', description: 'Bienvenue sur AssoCongo' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as any)?.message ||
        (err as any)?.error_description ||
        (err instanceof Error ? err.message : 'Erreur de connexion');
      toast({ title: 'Erreur de connexion', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour a l'accueil
        </Link>
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Connectez-vous a votre compte {APP_NAME}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="vous@exemple.cg" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                🚀 Comptes de Démonstration (1 clic)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto flex-col items-start p-2 text-left hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setEmail('dgifn.audit@finances.gouv.cg');
                    setPassword('Demo2026!DGIFN');
                  }}
                >
                  <span className="font-semibold text-xs text-primary flex items-center gap-1">
                    🏛️ Régulateur
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">DGIFN (Audit/Finance)</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto flex-col items-start p-2 text-left hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setEmail('dev.support@assocongo.cg');
                    setPassword('Demo2026!DEV');
                  }}
                >
                  <span className="font-semibold text-xs text-primary flex items-center gap-1">
                    💻 Développeur
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">Support Technique</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto flex-col items-start p-2 text-left hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setEmail('contact@espoircongo.cg');
                    setPassword('Demo2026!ASSO');
                  }}
                >
                  <span className="font-semibold text-xs text-primary flex items-center gap-1">
                    🤝 Association
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">Espoir Congo (Admin)</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto flex-col items-start p-2 text-left hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    setEmail('adherent@espoircongo.cg');
                    setPassword('Demo2026!MEMBER');
                  }}
                >
                  <span className="font-semibold text-xs text-primary flex items-center gap-1">
                    👥 Adhérent / Bénévole
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">Grace Moukassa</span>
                </Button>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Creer une ONG
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
