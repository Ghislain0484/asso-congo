'use client';

import { Printer, QrCode, Shield, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/constants';
import type { Member, Organization } from '@/lib/types';
import { MOCK_ORGANIZATION } from '@/lib/mock-data';

interface MembershipCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  organization?: Organization | null;
}

export function MembershipCardModal({ open, onOpenChange, member, organization }: MembershipCardModalProps) {
  const org = organization || MOCK_ORGANIZATION;

  if (!member) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none">
        <div className="p-6 bg-slate-900 text-white print:p-6 print:text-black">
          {/* Card Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-zinc-950 p-6 shadow-2xl">
            {/* Top band national colors */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <div className="w-1/3 bg-[#009543]"></div>
              <div className="w-1/3 bg-[#FBDE4A]"></div>
              <div className="w-1/3 bg-[#DC241F]"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <p className="text-[10px] tracking-widest uppercase font-semibold text-emerald-400">RÉPUBLIQUE DU CONGO</p>
                <h3 className="text-sm font-black text-white">{org.name}</h3>
                <p className="text-[10px] text-zinc-400">{org.address}, {org.city}</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                2026
              </Badge>
            </div>

            {/* Body */}
            <div className="flex items-center gap-4 mb-4">
              {/* Photo Avatar */}
              <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex flex-col items-center justify-center text-white font-black text-xl shadow-inner border border-white/20 shrink-0">
                <span>{member.first_name[0]}{member.last_name[0]}</span>
                <span className="text-[8px] tracking-widest font-normal uppercase opacity-75 mt-1">AEC</span>
              </div>

              {/* Identity Info */}
              <div className="text-xs space-y-0.5">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Titulaire de la carte</p>
                <p className="text-base font-bold text-white tracking-tight leading-tight">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-emerald-400 font-medium capitalize">
                  {member.membership_type === 'board' ? 'Membre du Bureau' : member.membership_type === 'volunteer' ? 'Bénévole Actif' : 'Adhérent'}
                </p>
                <p className="text-zinc-400 text-[11px] pt-1">
                  Matricule : <span className="font-mono text-white font-semibold">{member.card_number || 'CG-2026-00101'}</span>
                </p>
              </div>
            </div>

            {/* Validity & Status */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/40 border border-white/5 p-2.5 mb-4 text-[11px]">
              <div>
                <span className="text-zinc-400 text-[10px] block">Statut cotisation</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 inline" /> À jour (2026)
                </span>
              </div>
              <div>
                <span className="text-zinc-400 text-[10px] block">Département</span>
                <span className="text-white font-medium mt-0.5 block">{member.city || 'Brazzaville'}</span>
              </div>
            </div>

            {/* Footer QR code */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded p-0.5 flex items-center justify-center">
                  <QrCode className="w-9 h-9 text-black" />
                </div>
                <div className="text-[9px] text-zinc-400 leading-tight">
                  <p className="text-white font-semibold">Carte Officielle Numérique</p>
                  <p>Certifiée conforme DGIFN</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-zinc-400">
                <p>Valide jusqu'au</p>
                <p className="text-white font-semibold font-mono">31 Décembre 2026</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 bg-zinc-900 border-t border-white/10 flex sm:justify-between items-center print:hidden">
          <p className="text-xs text-zinc-400">Carte d'adhérent numérique certifiée.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Printer className="mr-2 h-4 w-4" /> Imprimer la carte
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
