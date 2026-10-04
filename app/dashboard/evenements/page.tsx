'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatDate, slugify, STATUS_LABELS } from '@/lib/constants';
import type { Event } from '@/lib/types';

export default function EventsPage() {
  const { currentOrg } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [registrationFee, setRegistrationFee] = useState(0);

  const loadEvents = async () => {
    if (!currentOrg) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', currentOrg.id)
      .is('deleted_at', null)
      .order('start_date', { ascending: true });
    if (data) setEvents(data as Event[]);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Evenements</h1>
          <p className="text-muted-foreground">{events.length} evenements au total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nouvel evenement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creer un evenement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" placeholder="Conference annuelle" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
                  <Input id="venue" placeholder="Hotel de ville" value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Date et heure</Label>
                <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacite</Label>
                  <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Frais d'inscription (FCFA)</Label>
                  <Input id="fee" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Creer l'evenement</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucun evenement pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">Creez votre premier evenement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const isUpcoming = new Date(e.start_date) > now;
            return (
              <Link key={e.id} href={`/dashboard/evenements/${e.id}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant={isUpcoming ? 'default' : 'secondary'}>{isUpcoming ? 'A venir' : 'Passe'}</Badge>
                      <Badge variant="outline">{STATUS_LABELS[e.status]}</Badge>
                    </div>
                    <h3 className="mb-2 font-semibold">{e.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Clock className="h-3 w-3" /> {formatDate(e.start_date)}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {e.location}</p>
                      {e.capacity && <p className="flex items-center gap-2"><Users className="h-3 w-3" /> {e.capacity} places</p>}
                      {e.registration_fee > 0 && <p className="font-medium text-primary">{formatCurrency(e.registration_fee)} FCFA</p>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
