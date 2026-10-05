'use client';

import { Printer, QrCode, Shield, CheckCircle2, Building2, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, APP_NAME } from '@/lib/constants';
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
      <DialogContent className="max-w-lg p-0 overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Printable Document Container */}
        <div className="printable-document bg-white p-6 md:p-8 print:p-8 text-zinc-900">
          
          {/* Print-Only Header: En-tête Officiel République du Congo */}
          <div className="hidden print:block avoid-break border-b-2 border-emerald-800 pb-4 mb-6">
            <div className="flex items-center justify-between text-xs text-zinc-600 uppercase tracking-widest font-semibold border-b border-zinc-200 pb-2 mb-3">
              <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                RÉPUBLIQUE DU CONGO
              </span>
              <span className="text-zinc-600 font-medium">Unité • Travail • Progrès</span>
              <span className="text-emerald-900 font-bold">REGISTRE NATIONAL DES ASSOCIATIONS</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black text-emerald-950 uppercase tracking-tight">
                  Carte d'Adhérent & Attestation d'Affiliation 2026
                </h1>
                <p className="text-xs text-zinc-600">
                  Délivrée en vertu des dispositions de la Loi du 1er Juillet 1901
                </p>
              </div>
              <Badge variant="outline" className="border-emerald-700 text-emerald-900 bg-emerald-50 font-mono text-xs px-2.5 py-1">
                MATRICULE : {member.card_number || 'CG-BZV-2026-00101'}
              </Badge>
            </div>
          </div>

          {/* Card Badge Frame (Styled for both Screen & Print) */}
          <div className="avoid-break relative rounded-2xl overflow-hidden border-2 border-emerald-700 bg-gradient-to-br from-emerald-950 via-slate-900 to-zinc-950 text-white p-6 shadow-xl print:shadow-none print:bg-slate-950">
            {/* Top band national colors */}
            <div className="absolute top-0 left-0 right-0 h-2 flex">
              <div className="w-1/3 bg-[#009543]"></div>
              <div className="w-1/3 bg-[#FBDE4A]"></div>
              <div className="w-1/3 bg-[#DC241F]"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-4 pt-1">
              <div>
                <p className="text-[10px] tracking-widest uppercase font-bold text-emerald-400">RÉPUBLIQUE DU CONGO</p>
                <h3 className="text-base font-black text-white">{org.name}</h3>
                <p className="text-[10px] text-zinc-300">{org.address}, {org.city} • Agrément DGIFN-2024</p>
              </div>
              <Badge className="bg-emerald-500/30 text-emerald-300 border border-emerald-400 text-xs font-mono font-bold px-2 py-0.5">
                EXERCICE 2026
              </Badge>
            </div>

            {/* Body */}
            <div className="flex items-center gap-4 mb-4">
              {/* Photo Avatar */}
              <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex flex-col items-center justify-center text-white font-black text-xl shadow-inner border border-white/30 shrink-0">
                <span>{member.first_name[0]}{member.last_name[0]}</span>
                <span className="text-[8px] tracking-widest font-normal uppercase opacity-80 mt-1">AEC</span>
              </div>

              {/* Identity Info */}
              <div className="text-xs space-y-0.5">
                <p className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">Titulaire de la carte</p>
                <p className="text-lg font-black text-white tracking-tight leading-tight">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-emerald-300 font-semibold capitalize text-xs">
                  {member.membership_type === 'board' ? 'Membre du Bureau Exécutif' : member.membership_type === 'volunteer' ? 'Bénévole Actif' : 'Adhérent Répertoire'}
                </p>
                <p className="text-zinc-300 text-xs pt-1">
                  Matricule : <span className="font-mono text-white font-bold">{member.card_number || 'CG-BZV-2026-00101'}</span>
                </p>
              </div>
            </div>

            {/* Validity & Status */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/50 border border-white/10 p-3 mb-4 text-[11px]">
              <div>
                <span className="text-zinc-300 text-[10px] block font-medium">Cotisation Statutaire</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 inline text-emerald-400" /> À jour (2026)
                </span>
              </div>
              <div>
                <span className="text-zinc-300 text-[10px] block font-medium">Département de rattachement</span>
                <span className="text-white font-semibold mt-0.5 block">{member.city || 'Brazzaville'}, Congo</span>
              </div>
            </div>

            {/* Footer QR code */}
            <div className="flex items-center justify-between border-t border-white/15 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white rounded p-0.5 flex items-center justify-center">
                  <QrCode className="w-9 h-9 text-black" />
                </div>
                <div className="text-[9px] text-zinc-300 leading-tight">
                  <p className="text-white font-bold">Carte Numérique Officielle</p>
                  <p>Certifiée conforme DGIFN</p>
                </div>
              </div>
              <div className="text-right text-[10px] text-zinc-300">
                <p>Validité de la carte :</p>
                <p className="text-white font-bold font-mono">31 Décembre 2026</p>
              </div>
            </div>
          </div>

          {/* Print-Only: Attestation Légale de Membre */}
          <div className="hidden print:block avoid-break mt-6 pt-4 border-t border-zinc-200 text-xs text-zinc-700 space-y-3">
            <p className="font-bold text-zinc-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-800" /> Mention Certificative
            </p>
            <p className="leading-relaxed">
              Le Bureau Exécutif de l'<strong>{org.name} ({org.acronym})</strong> atteste par la présente que <strong>{member.first_name} {member.last_name}</strong> est dûment inscrit(e) sur le registre de l'organisation conformément à la Loi du 1er Juillet 1901. La présente carte numérique confère à son titulaire le plein droit de participer aux assemblées générales et aux programmes de l'exercice 2026.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 mt-4 border-t border-zinc-200">
              <div>
                <p className="text-[11px] text-zinc-500 font-semibold">Authentification Numérique</p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Scannable par les autorités administratives congolaises pour vérifier l'authenticité de l'affiliation en temps réel sur la plateforme nationale {APP_NAME}.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-zinc-500">Pour le Bureau Exécutif :</p>
                <p className="font-bold text-xs text-zinc-900 mt-1">Marien Ngouabi, Président</p>
                <div className="inline-block mt-1 px-3 py-1 border border-dashed border-emerald-600 rounded bg-emerald-50 text-[10px] text-emerald-800 font-mono">
                  [ Visa & Sceau Certifié ]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <DialogFooter className="p-4 bg-zinc-50 border-t border-zinc-200 flex sm:justify-between items-center print:hidden">
          <p className="text-xs text-zinc-500">Carte d'adhérent officielle avec QR code de contrôle.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Printer className="mr-2 h-4 w-4" /> Imprimer / Exporter PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
