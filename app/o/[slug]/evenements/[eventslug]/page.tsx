'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Calendar, MapPin, Clock, Users, UserPlus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatDate, formatDateTime, STATUS_LABELS } from '@/lib/constants';
import type { Event, Organization, EventRegistration } from '@/lib/types';

export default function PublicEventDetailPage() {
  const { slug, eventslug } = useParams();
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!slug || !eventslug) return;
    (async () => {
      const { data: orgData } = await supabase.from('organizations').select('*').eq('slug', slug).maybeSingle();
      if (!orgData) { setLoading(false); return; }
      setOrg(orgData as Organization);
      const { data: evtData } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', orgData.id)
        .eq('slug', eventslug)
        .maybeSingle();
      if (evtData) {
        setEvent(evtData as Event);
        const { data: regs } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', evtData.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });
        if (regs) setRegistrations(regs as EventRegistration[]);
      }
      setLoading(false);
    })();
  }, [slug, eventslug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !org) return;
    setRegistering(true);
    const { error } = await supabase.from('event_registrations').insert({
      event_id: event.id,
      organization_id: org.id,
      participant_name: name,
      participant_email: email || null,
      participant_phone: phone || null,
      status: 'registered',
      payment_status: event.registration_fee > 0 ? 'pending' : 'free',
    });
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setRegistered(true);
      toast({ title: 'Inscription reussie', description: 'Vous etes inscrit a cet evenement' });
    }
    setRegistering(false);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!org || !event) {
    return <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Evenement introuvable</h1>
      <Link href={`/o/${slug}`}><Button className="mt-4">Voir l'ONG</Button></Link>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href={`/o/${org.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> {org.name}
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>{STATUS_LABELS[event.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {event.description && <p className="mb-4 text-muted-foreground">{event.description}</p>}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {formatDateTime(event.start_date)}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</div>
                  {event.venue && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.venue}</div>}
                  {event.capacity && <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {event.capacity} places</div>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardContent className="p-5">
                {registered ? (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <p className="font-semibold">Inscription confirmee !</p>
                    <p className="mt-1 text-sm text-muted-foreground">Nous vous attendons a l'evenement.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="text-center">
                      <p className="mb-1 text-2xl font-bold text-primary">
                        {event.registration_fee > 0 ? `${formatCurrency(event.registration_fee)} FCFA` : 'Gratuit'}
                      </p>
                      <p className="text-xs text-muted-foreground">{registrations.length} inscrits{event.capacity ? ` / ${event.capacity}` : ''}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telephone</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={registering}>
                      {registering ? 'Inscription...' : <><UserPlus className="mr-2 h-4 w-4" /> S'inscrire</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
