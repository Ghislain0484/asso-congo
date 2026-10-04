'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Shield, Search, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase-client';
import { MOCK_ORGANIZATIONS } from '@/lib/mock-data';
import type { Organization } from '@/lib/types';
import { APP_NAME } from '@/lib/constants';

export default function AssociationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setOrgs(data as Organization[]);
      } else {
        setOrgs(MOCK_ORGANIZATIONS);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = orgs.filter((o) => {
    const q = search.toLowerCase();
    return o.name.toLowerCase().includes(q) || (o.description || '').toLowerCase().includes(q) || (o.city || '').toLowerCase().includes(q) || o.province.toLowerCase().includes(q) || o.domains.some((d) => d.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-primary">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
            <Link href="/register"><Button size="sm">Creer une ONG</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">Associations congolaises</h1>
        <p className="mb-6 text-muted-foreground">Decouvrez et soutenez les ONG inscrites sur AssoCongo</p>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, ville, domaine..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            {search ? 'Aucune association trouvee' : 'Aucune association inscrite pour le moment'}
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((org) => (
              <Link key={org.id} href={`/o/${org.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                        {org.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{org.name}</h3>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {org.city}, {org.province}
                        </p>
                      </div>
                    </div>
                    {org.description && <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{org.description}</p>}
                    <div className="flex flex-wrap gap-1">
                      {org.is_verified && <Badge className="bg-primary/10 text-primary text-xs"><Shield className="mr-1 h-3 w-3" /> Verifiee</Badge>}
                      {org.domains.slice(0, 2).map((d) => <Badge key={d} variant="outline" className="text-xs">{d}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
