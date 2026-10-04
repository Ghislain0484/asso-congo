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

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/membres', label: 'Membres', icon: Users },
  { href: '/dashboard/campagnes', label: 'Campagnes', icon: Heart },
  { href: '/dashboard/evenements', label: 'Evenements', icon: Calendar },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { href: '/dashboard/parametres', label: 'Parametres', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, currentOrg, organizations, loading, signOut, setCurrentOrg } = useAuth();
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

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-4 w-4" />
              </div>
              <span className="hidden text-lg font-bold text-primary sm:block">{APP_NAME}</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {currentOrg && (
              <Link href={`/o/${currentOrg.slug}`} target="_blank">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Globe className="mr-2 h-4 w-4" /> Page publique
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium sm:block">
                    {profile?.full_name || user.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{profile?.full_name || 'Utilisateur'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {orgRole && (
                    <Badge variant="secondary" className="mt-1 text-xs">{ROLE_LABELS[orgRole]}</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.length > 1 && (
                  <>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Changer d'ONG</DropdownMenuLabel>
                    {organizations.map((om) => (
                      <DropdownMenuItem
                        key={om.organization_id}
                        onClick={() => setCurrentOrg(om.organization)}
                        className="cursor-pointer"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span className="flex-1 truncate">{om.organization.name}</span>
                        {currentOrg?.id === om.organization.id && (
                          <Shield className="h-3 w-3 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Deconnexion
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
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {currentOrg && (
            <div className="mt-4 border-t p-4">
              <p className="mb-1 text-xs text-muted-foreground">ONG actuelle</p>
              <p className="truncate text-sm font-semibold">{currentOrg.name}</p>
              {currentOrg.is_verified && (
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                  <Shield className="mr-1 h-3 w-3" /> Verifiee
                </Badge>
              )}
            </div>
          )}
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
