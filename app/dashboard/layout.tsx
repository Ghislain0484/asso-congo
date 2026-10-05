'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  Receipt,
  Settings,
  Globe,
  LogOut,
  ChevronDown,
  Shield,
  Building2,
  CreditCard,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, APP_NAME } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    user,
    profile,
    currentOrg,
    organizations,
    loading,
    signOut,
    setCurrentOrg,
    demoPersona,
    setDemoPersona,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const orgRole = organizations.find((o) => o.organization_id === currentOrg?.id)?.role;

  // Navigation adaptative selon le rôle HelloAsso sélectionné
  const navItems = demoPersona === 'adherent'
    ? [
        { href: '/dashboard', label: 'Mon Espace Adhérent', icon: LayoutDashboard },
        { href: '/dashboard/membres', label: 'Ma Carte 2026', icon: CreditCard },
        { href: '/dashboard/campagnes', label: 'Projets Solidaires', icon: Heart },
        { href: '/dashboard/evenements', label: 'Mes Billets & Inscriptions', icon: Calendar },
        { href: '/dashboard/transactions', label: 'Mes Reçus Fiscaux', icon: Receipt },
      ]
    : demoPersona === 'regulator'
    ? [
        { href: '/dashboard', label: 'Tour de Contrôle DGIFN', icon: LayoutDashboard },
        { href: '/dashboard/transactions', label: 'Surveillance Flux & ANIF', icon: Receipt },
        { href: '/dashboard/campagnes', label: 'Collectes Nationales', icon: Heart },
        { href: '/dashboard/membres', label: 'Répertoire des Membres', icon: Users },
        { href: '/dashboard/parametres', label: 'Agréments & Tutelle', icon: Settings },
      ]
    : [
        { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { href: '/dashboard/membres', label: 'Membres & CRM', icon: Users },
        { href: '/dashboard/campagnes', label: 'Campagnes', icon: Heart },
        { href: '/dashboard/evenements', label: 'Événements', icon: Calendar },
        { href: '/dashboard/transactions', label: 'Transactions & CER', icon: Receipt },
        { href: '/dashboard/parametres', label: 'Paramètres & Dossier', icon: Settings },
      ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </div>
              <span className="hidden text-lg font-bold text-primary lg:block">{APP_NAME}</span>
            </Link>
          </div>

          {/* SÉLECTEUR RAPIDE DE RÔLE DÉMO (HELLOASSO 3 COMPTES) */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-muted/70 p-1 text-xs">
            <button
              type="button"
              onClick={() => setDemoPersona('adherent')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold transition-all ${
                demoPersona === 'adherent'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Espace Adhérent / Donateur Citoyen (Grace Moukassa)"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Adhérent</span>
              <span className="text-[10px] opacity-80">(Grace)</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoPersona('association')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold transition-all ${
                demoPersona === 'association'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Espace Bureau Gestionnaire d'ONG (Marien Ngouabi)"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bureau ONG</span>
              <span className="text-[10px] opacity-80">(Marien)</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoPersona('regulator')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold transition-all ${
                demoPersona === 'regulator'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Tour de Contrôle État / Tutelle (Ministère des Finances & DGIFN)"
            >
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Contrôle État</span>
              <span className="text-[10px] opacity-80">(DGIFN)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentOrg && (
              <Link href={`/o/${currentOrg.slug}`} target="_blank">
                <Button variant="ghost" size="sm" className="hidden xl:flex">
                  <Globe className="mr-2 h-4 w-4" /> Page publique
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {demoPersona === 'adherent'
                      ? 'GM'
                      : demoPersona === 'regulator'
                      ? 'DG'
                      : (profile?.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium md:block">
                    {demoPersona === 'adherent'
                      ? 'Grace Moukassa (Adhérente)'
                      : demoPersona === 'regulator'
                      ? 'Inspection Générale DGIFN'
                      : profile?.full_name || user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">
                    {demoPersona === 'adherent'
                      ? 'Grace Moukassa'
                      : demoPersona === 'regulator'
                      ? 'Direction Générale DGIFN'
                      : profile?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {demoPersona === 'adherent'
                      ? 'adherent@espoircongo.cg'
                      : demoPersona === 'regulator'
                      ? 'dgifn.audit@finances.gouv.cg'
                      : user.email}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {demoPersona === 'adherent'
                      ? 'Adhérente & Bénévole'
                      : demoPersona === 'regulator'
                      ? 'Régulateur d\'État'
                      : 'Bureau Exécutif ONG'}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-background md:block">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Rôle actuel dans la sidebar */}
          <div className="mt-4 border-t p-4 space-y-2">
            <div className="rounded-xl bg-muted/60 p-3 border border-border text-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Vue Active (Démo)
              </span>
              <p className="font-bold text-sm text-zinc-900 mt-0.5">
                {demoPersona === 'adherent'
                  ? 'Espace Citoyen Adhérent'
                  : demoPersona === 'regulator'
                  ? 'Tour de Contrôle DGIFN'
                  : 'Bureau Gestionnaire AEC'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {demoPersona === 'adherent'
                  ? 'Reçus, adhésion, billets'
                  : demoPersona === 'regulator'
                  ? '12 départements, ANIF'
                  : 'Gestion collectes & CER'}
              </p>
            </div>

            {currentOrg && (
              <div className="p-1 text-xs text-muted-foreground">
                <p className="text-[10px] uppercase font-semibold">Organisation de référence</p>
                <p className="font-medium text-foreground truncate">{currentOrg.name}</p>
                <Badge variant="outline" className="mt-1 border-emerald-600 text-emerald-800 text-[10px]">
                  Agrément DGIFN-2024
                </Badge>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
          <nav className="flex items-center justify-around px-2 py-2">
            {navItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
          <div className="container mx-auto max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
