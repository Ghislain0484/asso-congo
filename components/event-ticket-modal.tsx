'use client';

import { Printer, QrCode, Shield, CheckCircle2, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime, APP_NAME } from '@/lib/constants';
import type { Event, EventRegistration, Organization } from '@/lib/types';
import { MOCK_ORGANIZATION } from '@/lib/mock-data';

interface EventTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  registration?: EventRegistration | null;
  organization?: Organization | null;
}

export function EventTicketModal({
  open,
  onOpenChange,
  event,
  registration,
  organization,
}: EventTicketModalProps) {
  const org = organization || MOCK_ORGANIZATION;

  if (!event) return null;

  const handlePrint = () => {
    window.print();
  };

  const participantName = registration?.participant_name || 'Grace Moukassa';
  const participantPhone = registration?.participant_phone || '+242 05 500 00 04';
  const ticketRef = registration?.id
    ? `TCK-CG-${registration.id.toUpperCase()}`
    : 'TCK-CG-2026-DICTEE-0101';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        <div className="printable-document bg-white p-6 md:p-8 print:p-8 text-zinc-900">
          
          {/* Header officiel */}
          <div className="avoid-break border-b-2 border-emerald-800 pb-4 mb-5">
            <div className="flex items-center justify-between text-xs text-zinc-600 uppercase tracking-widest font-semibold border-b border-zinc-200 pb-2 mb-3">
              <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                RÉPUBLIQUE DU CONGO
              </span>
              <span className="text-zinc-600 font-medium">Unité • Travail • Progrès</span>
              <span className="text-emerald-900 font-bold">BILLETTERIE OFFICIELLE</span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-emerald-700" />
                  BILLET ÉLECTRONIQUE D'ACCÈS
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Organisé par l'{org.name} ({org.acronym})
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-emerald-700 text-emerald-900 bg-emerald-50 font-mono text-xs px-2.5 py-1">
                  N° {ticketRef}
                </Badge>
                <p className="text-[10px] text-zinc-500 mt-1">Accès réservé & certifié</p>
              </div>
            </div>
          </div>

          {/* Ticket Card */}
          <div className="avoid-break rounded-2xl border-2 border-dashed border-emerald-600/60 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/50 p-5 mb-5 relative overflow-hidden">
            {/* National top line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="w-1/3 bg-[#009543]"></div>
              <div className="w-1/3 bg-[#FBDE4A]"></div>
              <div className="w-1/3 bg-[#DC241F]"></div>
            </div>

            <div className="pt-2">
              <Badge className="bg-emerald-700 text-white text-[11px] font-semibold mb-2">
                Événement Confirmé
              </Badge>
              <h3 className="text-base font-black text-zinc-900 tracking-tight leading-snug">
                {event.title}
              </h3>
              <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                {event.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-200 text-xs">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Date de l'événement</p>
                  <p className="font-semibold text-zinc-900">{formatDate(event.start_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-500">Lieu & Salle</p>
                  <p className="font-semibold text-zinc-900">{event.venue}</p>
                  <p className="text-[10px] text-zinc-500">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 grid grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-xl border border-zinc-200">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase">Participant inscrit</p>
                <p className="font-bold text-sm text-zinc-900">{participantName}</p>
                <p className="text-[11px] text-zinc-600 font-mono">{participantPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase">Frais d'inscription</p>
                <p className="font-bold text-sm text-emerald-800">
                  {event.registration_fee > 0 ? `${event.registration_fee} FCFA` : 'Entrée Gratuite'}
                </p>
                <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 mt-0.5">
                  Émargement Prêt
                </Badge>
              </div>
            </div>
          </div>

          {/* QR Code de contrôle */}
          <div className="avoid-break flex items-center justify-between border-t border-zinc-200 pt-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border border-zinc-300 rounded p-1 bg-white flex items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-zinc-900" />
              </div>
              <div className="text-[11px] text-zinc-600 leading-tight">
                <p className="font-bold text-zinc-900 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> Contrôle d'accès à l'accueil
                </p>
                <p className="mt-1">
                  Présentez ce QR code sur votre smartphone ou imprimé à l'entrée pour valider votre présence.
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-zinc-500 shrink-0 ml-4">
              <p className="font-mono font-bold text-emerald-800">AEC-2026-VALIDE</p>
              <p>Brazzaville, Congo</p>
            </div>
          </div>

          <div className="hidden print:block mt-6 pt-3 border-t border-zinc-100 text-[9px] text-center text-zinc-400">
            Billet électronique généré par {APP_NAME} sous le contrôle de l'{org.name}. Conformité réglementaire garantie.
          </div>
        </div>

        <DialogFooter className="p-4 bg-zinc-50 border-t border-zinc-200 flex sm:justify-between items-center print:hidden">
          <p className="text-xs text-zinc-500">Billet valable pour une personne.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Printer className="mr-2 h-4 w-4" /> Imprimer le billet
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
