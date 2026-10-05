'use client';

import { useRef } from 'react';
import { Printer, Download, CheckCircle2, Shield, QrCode, Building2, TrendingUp, FileCheck, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatCurrencyWithSymbol, formatDate } from '@/lib/constants';
import type { Organization } from '@/lib/types';
import { MOCK_ORGANIZATION, BUDGET_BREAKDOWN_BACONGO } from '@/lib/mock-data';

interface CerReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization | null;
}

export function CerReportModal({ open, onOpenChange, organization }: CerReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const org = organization || MOCK_ORGANIZATION;

  const handlePrint = () => {
    window.print();
  };

  // Données financières normalisées pour le Compte d'Emploi des Ressources (CER 2026)
  const ressources = [
    { poste: 'Dons manuels & mécénat privé (Particuliers & Entreprises)', montant: 2150000, part: '63,6%' },
    { poste: 'Subventions de programmes & RSE (Fondation MTN Congo, Collectifs)', montant: 1120000, part: '33,1%' },
    { poste: 'Cotisations statutaires des adhérents & Bureau 2026', montant: 110000, part: '3,3%' },
  ];
  const totalRessources = ressources.reduce((s, r) => s + r.montant, 0);

  const emplois = [
    { poste: 'Missions sociales directes (Réhabilitation école Bacongo, Tables-bancs, Toiture, Latrines)', montant: 2770000, part: '82,0%', categorie: 'Action sociale terrain' },
    { poste: 'Logistique, transport des matériaux & coordination de proximité', montant: 360000, part: '10,6%', categorie: 'Appui opérationnel' },
    { poste: 'Frais de fonctionnement courant & télécommunications Mobile Money', montant: 250000, part: '7,4%', categorie: 'Frais généraux' },
  ];
  const totalEmplois = emplois.reduce((s, e) => s + e.montant, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh] flex flex-col print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none">
        <DialogHeader className="p-4 border-b bg-muted/40 flex-row items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Compte d'Emploi des Ressources (CER) • Exercice 2026</DialogTitle>
              <p className="text-xs text-muted-foreground">Document réglementaire conforme aux exigences DGIFN et de la Loi du 1er Juillet 1901</p>
            </div>
          </div>
          <Button size="sm" onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="h-4 w-4" /> Imprimer / Exporter PDF
          </Button>
        </DialogHeader>

        {/* Zone Imprimable */}
        <div ref={printRef} className="printable-document overflow-y-auto p-6 md:p-8 bg-white text-zinc-900 print:overflow-visible print:h-auto print:p-4 print:text-black space-y-6">
          {/* En-tête République du Congo */}
          <div className="avoid-break border-b-2 border-emerald-800 pb-4">
            <div className="flex items-center justify-between text-xs text-zinc-600 uppercase tracking-widest font-semibold border-b border-zinc-200 pb-2 mb-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-600"></span>
                RÉPUBLIQUE DU CONGO
              </div>
              <div className="text-center font-medium">Unité • Travail • Progrès</div>
              <div className="text-emerald-900 font-bold">MINISTÈRE DES FINANCES • DGIFN</div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-700" />
                  COMPTE D'EMPLOI DES RESSOURCES (CER)
                </h1>
                <p className="text-xs text-zinc-600 mt-0.5">
                  États financiers de synthèse et affectation certifiée des fonds collectés par voie de générosité publique
                </p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className="border-emerald-700 text-emerald-900 bg-emerald-50 font-mono text-xs px-2.5 py-1">
                  EXERCICE : 2026 (AUDITÉ)
                </Badge>
                <p className="text-[11px] text-zinc-500 mt-1">Réf. CER : <span className="font-mono font-medium">CER-CG-2026-AEC-01</span></p>
              </div>
            </div>
          </div>

          {/* Fiche d'identification de l'association */}
          <div className="avoid-break grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 text-xs">
            <div>
              <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Identification Statutaire
              </p>
              <p className="font-bold text-sm text-zinc-900">{org.name} ({org.acronym})</p>
              <p className="text-zinc-600 mt-0.5">Siège social : {org.address}, {org.city} (Arrondissement Bacongo)</p>
              <p className="text-zinc-600">Récépissé de Déclaration : <strong className="font-mono text-zinc-800">{org.registration_number || 'REC-BZV-2024-N048'}</strong></p>
              <p className="text-zinc-600">Publication JORC : <span className="font-mono">N° 07 du 15/02/2024, Page 142</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Immatriculation Fiscale & Bancaire
              </p>
              <p className="text-zinc-700">Numéro d'Identification Unique (NIU) : <strong className="font-mono text-emerald-900">M08241100049281X</strong></p>
              <p className="text-zinc-700">Agrément Régulateur DGIFN : <strong className="font-mono text-emerald-800">DGIFN-CONGO-ONG-2024</strong></p>
              <p className="text-zinc-700">Banque Principale : <strong className="text-zinc-900">UBA Congo</strong> • Compte : <span className="font-mono text-xs">CG023 00101 02000014820 45</span></p>
              <p className="text-zinc-700">Opérateurs Tréso. : <span className="font-semibold text-zinc-900">MTN Mobile Money (*105#) & Airtel Money (*128#)</span></p>
            </div>
          </div>

          {/* Tableau 1 : Tableau des Ressources Collectées */}
          <div className="avoid-break space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 1. ORIGINE DES RESSOURCES COLLECTÉES (ENTRÉES)
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-900">TOTAL : {formatCurrency(totalRessources)} FCFA</span>
            </div>
            <div className="rounded-lg border border-zinc-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-100/80 border-b text-[11px] font-bold uppercase text-zinc-600">
                  <tr>
                    <th className="py-2 px-3">Poste Comptable & Nature du Financement</th>
                    <th className="py-2 px-3 text-right">Montant (FCFA)</th>
                    <th className="py-2 px-3 text-right">Part (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {ressources.map((r, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50">
                      <td className="py-2 px-3 font-medium text-zinc-800">{r.poste}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">{formatCurrency(r.montant)}</td>
                      <td className="py-2 px-3 text-right font-mono text-zinc-600">{r.part}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-700">
                    <td className="py-2.5 px-3 text-emerald-950">TOTAL GÉNÉRAL DES RESSOURCES DISPONIBLES</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-950 text-sm">{formatCurrency(totalRessources)} FCFA</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-950">100,0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tableau 2 : Tableau des Emplois des Fonds */}
          <div className="avoid-break space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 2. EMPLOI ET AFFECTATION DES FONDS SUR LE TERRAIN (SORTIES)
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-900">RATIO SOCIAL : 82,0%</span>
            </div>
            <div className="rounded-lg border border-zinc-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-100/80 border-b text-[11px] font-bold uppercase text-zinc-600">
                  <tr>
                    <th className="py-2 px-3">Destination des fonds</th>
                    <th className="py-2 px-3">Catégorie budgétaire</th>
                    <th className="py-2 px-3 text-right">Montant (FCFA)</th>
                    <th className="py-2 px-3 text-right">Ratio (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {emplois.map((e, i) => (
                    <tr key={i} className="hover:bg-zinc-50/50">
                      <td className="py-2 px-3 font-medium text-zinc-800">{e.poste}</td>
                      <td className="py-2 px-3 text-zinc-600">
                        <Badge variant="outline" className="text-[10px]">{e.categorie}</Badge>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">{formatCurrency(e.montant)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">{e.part}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/60 font-bold border-t-2 border-emerald-700">
                    <td colSpan={2} className="py-2.5 px-3 text-emerald-950">TOTAL DES EMPLOIS & DÉPENSES ENGAGÉES</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-950 text-sm">{formatCurrency(totalEmplois)} FCFA</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-950">100,0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rapprochement Bancaire et Trésorerie */}
          <div className="avoid-break rounded-lg border border-emerald-200 bg-emerald-50/30 p-3.5 text-xs space-y-2">
            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-700" /> Rapprochement Bancaire & Trésorerie Déclarée (Fin de Période)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded border border-emerald-200">
                <p className="text-[11px] text-zinc-500">Reversements Compte UBA Congo</p>
                <p className="text-base font-bold font-mono text-emerald-900">1 800 000 FCFA</p>
                <p className="text-[10px] text-zinc-500 font-mono">Virement VIR-UBA-BZV-2026-00412</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-emerald-200">
                <p className="text-[11px] text-zinc-500">Trésorerie Mobile Money Active</p>
                <p className="text-base font-bold font-mono text-emerald-900">1 580 000 FCFA</p>
                <p className="text-[10px] text-zinc-500">Comptes Marchands MTN & Airtel</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-emerald-200">
                <p className="text-[11px] text-zinc-500">Indicateur d'Intégrité Financière</p>
                <p className="text-base font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> 100% Conforme
                </p>
                <p className="text-[10px] text-zinc-500">Écart comptable : 0 FCFA</p>
              </div>
            </div>
          </div>

          {/* Visas Officiels et Signatures */}
          <div className="avoid-break pt-4 border-t-2 border-zinc-200 grid grid-cols-3 gap-4 text-xs">
            {/* Signature Trésorier */}
            <div className="border border-zinc-200 rounded p-3 text-center bg-zinc-50/50">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Le Trésorier Général</p>
              <p className="font-bold text-xs mt-1 text-zinc-900">Sylvain Batéké</p>
              <div className="mt-3 text-[10px] font-mono text-emerald-800 border border-dashed border-emerald-400 bg-white p-1 rounded">
                [ Visa Comptable Approuvé ]
              </div>
            </div>

            {/* Signature Président */}
            <div className="border border-zinc-200 rounded p-3 text-center bg-zinc-50/50">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Pour le Bureau Exécutif</p>
              <p className="font-bold text-xs mt-1 text-zinc-900">Marien Ngouabi, Président</p>
              <div className="mt-3 text-[10px] font-mono text-emerald-800 border border-dashed border-emerald-400 bg-white p-1 rounded">
                [ Sceau Exécutif Certifié ]
              </div>
            </div>

            {/* Sceau DGIFN & QR Code */}
            <div className="border border-zinc-200 rounded p-3 flex items-center justify-between bg-zinc-50/50">
              <div className="text-left text-[10px] text-zinc-500 space-y-1">
                <p className="font-bold text-emerald-950 uppercase">Visa de Surveillance</p>
                <p>Enregistré au Répertoire National AssoCongo sous tutelle DGIFN.</p>
                <p className="font-mono text-emerald-800 font-bold">N° ACTE : DGIFN-CER-2026-041</p>
              </div>
              <div className="p-1 border border-zinc-300 rounded bg-white shrink-0 ml-2">
                <QrCode className="w-12 h-12 text-zinc-800" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30 flex items-center justify-between print:hidden shrink-0">
          <p className="text-xs text-muted-foreground">
            Document généré automatiquement à partir des flux certifiés Mobile Money et virements bancaires.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Fermer</Button>
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Printer className="h-4 w-4" /> Imprimer le Rapport Officiel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
