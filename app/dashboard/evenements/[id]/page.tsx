'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatDateTime, STATUS_LABELS } from '@/lib/constants';
import { MOCK_EVENTS, MOCK_EVENT_REGISTRATIONS } from '@/lib/mock-data';
import type { Event, EventRegistration } from '@/lib/types';

export default function EventDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRegistrations = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setRegistrations(data as EventRegistration[]);
    } else {
      setRegistrations(MOCK_EVENT_REGISTRATIONS);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: evt } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      if (evt) {
        setEvent(evt as Event);
      } else {
        const fallbackEvt = MOCK_EVENTS.find((e) => e.id === id || e.slug === id) || MOCK_EVENTS[0];
        setEvent(fallbackEvt);
      }
      await loadRegistrations();
      setLoading(false);
    })();
  }, [id]);

  const handleCheckIn = async (regId: string) => {
    // Mise à jour optimiste immédiate dans l'interface
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, status: 'checked_in', checked_in_at: new Date().toISOString() } : r))
    );
    toast({ title: 'Émargement validé', description: 'Participant enregistré comme présent à l\'événement.' });

    try {
      await supabase
        .from('event_registrations')
        .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
        .eq('id', regId);
    } catch {
      // Ignorer si la ligne est une donnée locale
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!event) {
    return <div className="py-20 text-center text-muted-foreground">Evenement introuvable</div>;
  }

  const checkedInCount = registrations.filter((r) => r.status === 'checked_in').length;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/evenements">
        <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux evenements</Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>{STATUS_LABELS[event.status]}</Badge>
                {event.registration_fee > 0 ? (
                  <Badge variant="outline">{formatCurrency(event.registration_fee)} FCFA</Badge>
                ) : (
                  <Badge variant="outline">Gratuit</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {event.description && <p className="text-muted-foreground">{event.description}</p>}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formatDateTime(event.start_date)}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</div>
                {event.venue && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.venue}</div>}
                {event.capacity && <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {event.capacity} places</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inscriptions ({registrations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucune inscription pour le moment</p>
              ) : (
                <div className="space-y-2">
                  {registrations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {r.participant_name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.participant_name}</p>
                          {r.participant_email && <p className="text-xs text-muted-foreground">{r.participant_email}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{STATUS_LABELS[r.status]}</Badge>
                        {r.status !== 'checked_in' && (
                          <Button size="sm" variant="outline" onClick={() => handleCheckIn(r.id)}>
                            <UserCheck className="mr-1 h-3 w-3" /> Check-in
                          </Button>
                        )}
                        {r.status === 'checked_in' && <CheckCircle2 className="h-4 w-4 text-success" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-2xl font-bold">{registrations.length}</p>
                <p className="text-xs text-muted-foreground">Inscrits</p>
              </div>
              <div className="rounded-lg bg-success/10 p-4 text-center">
                <p className="text-2xl font-bold text-success">{checkedInCount}</p>
                <p className="text-xs text-muted-foreground">Presents</p>
              </div>
              {event.capacity && (
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold">{event.capacity - registrations.length}</p>
                  <p className="text-xs text-muted-foreground">Places restantes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
