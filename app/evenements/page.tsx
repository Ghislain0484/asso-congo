'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Calendar, MapPin, Clock, ArrowRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatDate, APP_NAME } from '@/lib/constants';
import { MOCK_EVENTS, MOCK_ORGANIZATION } from '@/lib/mock-data';
import type { Event, Organization } from '@/lib/types';

export default function EventsPublicPage() {
  const [events, setEvents] = useState<(Event & { organization: Organization })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('*, organization:organizations(*)')
        .eq('status', 'active')
        .eq('is_public', true)
        .is('deleted_at', null)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      if (data && data.length > 0) {
        setEvents(data as (Event & { organization: Organization })[]);
      } else {
        const fallback = MOCK_EVENTS.map((e) => ({ ...e, organization: MOCK_ORGANIZATION }));
        setEvents(fallback);
      }
      setLoading(false);
    })();
  }, []);

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
        <h1 className="mb-2 text-3xl font-bold">Evenements a venir</h1>
        <p className="mb-6 text-muted-foreground">Participez aux evenements des associations congolaises</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : events.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            Aucun evenement a venir pour le moment
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <Link key={e.id} href={`/o/${e.organization.slug}/evenements/${e.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-2 text-xs">{e.organization.name}</Badge>
                    <h3 className="mb-3 font-semibold">{e.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Clock className="h-3 w-3" /> {formatDate(e.start_date)}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {e.location}</p>
                      {e.capacity && <p className="flex items-center gap-2"><Users className="h-3 w-3" /> {e.capacity} places</p>}
                      {e.registration_fee > 0 && <p className="font-medium text-primary">{formatCurrency(e.registration_fee)} FCFA</p>}
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
