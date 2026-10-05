'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, Clock, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { EventTicketModal } from '@/components/event-ticket-modal';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatDate, slugify, STATUS_LABELS } from '@/lib/constants';
import { MOCK_EVENTS, MOCK_ORGANIZATION, MOCK_EVENT_REGISTRATIONS } from '@/lib/mock-data';
import type { Event } from '@/lib/types';

export default function EventsPage() {
  const { currentOrg, demoPersona } = useAuth();
  const effectiveOrg = currentOrg || MOCK_ORGANIZATION;
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<Event | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [registrationFee, setRegistrationFee] = useState(0);

  const loadEvents = async () => {
    if (!currentOrg) {
      setEvents(MOCK_EVENTS);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .is('deleted_at', null)
      .order('start_date', { ascending: true });
    if (data && data.length > 0) {
      setEvents(data as Event[]);
    } else {
      setEvents(MOCK_EVENTS);
    }
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, [currentOrg]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    let slug = slugify(title);
    const { data: existing } = await supabase.from('events').select('id').eq('organization_id', currentOrg.id).eq('slug', slug).maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('events')
      .insert({
        organization_id: currentOrg.id,
        title,
        slug,
        description: description || null,
        location,
        venue: venue || null,
        start_date: new Date(startDate).toISOString(),
        capacity,
        registration_fee: registrationFee,
        status: 'active',
      })
      .select()
      .single();
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Evenement cree', description: `"${title}" est maintenant en ligne` });
      setEvents((prev) => [data as Event, ...prev]);
      setDialogOpen(false);
      setTitle(''); setDescription(''); setLocation(''); setVenue(''); setStartDate(''); setCapacity(100); setRegistrationFee(0);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Bannière Adhérent (Grace Moukassa) */}
      {demoPersona === 'adherent' && (
        <Card className="border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 text-white shadow-md">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-emerald-400 font-bold">Votre Billet Électronique d'Événement</p>
              <h3 className="text-base font-bold text-white">Grande dictée solidaire et distribution de manuels scolaires</h3>
              <p className="text-xs text-zinc-300">
                Lieu : Maison Commune de Bacongo • Inscription confirmée avec QR code d'accès scannable.
              </p>
            </div>
            <Button
              onClick={() => setSelectedTicketEvent(events[0] || MOCK_EVENTS[0])}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-2 shrink-0"
            >
              <Ticket className="h-4 w-4" /> Ouvrir & Imprimer mon Billet
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Événements & Billetterie</h1>
          <p className="text-muted-foreground">{events.length} événements programmés</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nouvel événement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un événement</DialogTitle>
              <DialogDescription>Renseignez les informations de votre événement solidaire.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" placeholder="Conférence annuelle" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Brazzaville" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Adresse (optionnel)</Label>
                  <Input id="venue" placeholder="Hôtel de ville" value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date et heure</Label>
                <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacité</Label>
                  <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Frais d'inscription (FCFA)</Label>
                  <Input id="fee" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Créer l'événement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucun événement pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">Créez votre premier événement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const isUpcoming = new Date(e.start_date) > now;
            return (
              <Card key={e.id} className="h-full flex flex-col justify-between transition-shadow hover:shadow-lg">
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant={isUpcoming ? 'default' : 'secondary'}>{isUpcoming ? 'À venir' : 'Passé'}</Badge>
                      <Badge variant="outline">{STATUS_LABELS[e.status]}</Badge>
                    </div>
                    <Link href={`/dashboard/evenements/${e.id}`}>
                      <h3 className="mb-2 font-bold hover:text-primary transition-colors">{e.title}</h3>
                    </Link>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Clock className="h-3 w-3" /> {formatDate(e.start_date)}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {e.location}</p>
                      {e.capacity && <p className="flex items-center gap-2"><Users className="h-3 w-3" /> {e.capacity} places</p>}
                      {e.registration_fee > 0 && <p className="font-medium text-primary">{formatCurrency(e.registration_fee)} FCFA</p>}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTicketEvent(e)}
                      className="text-xs text-emerald-800 border-emerald-600 hover:bg-emerald-50 gap-1.5"
                    >
                      <Ticket className="h-3.5 w-3.5" /> Billet QR Code
                    </Button>
                    <Link href={`/dashboard/evenements/${e.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Détails →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      <EventTicketModal
        open={!!selectedTicketEvent}
        onOpenChange={(open) => !open && setSelectedTicketEvent(null)}
        event={selectedTicketEvent}
        registration={MOCK_EVENT_REGISTRATIONS[0]}
        organization={effectiveOrg}
      />
    </div>
  );
}
