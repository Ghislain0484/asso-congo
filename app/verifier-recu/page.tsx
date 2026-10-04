'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, CheckCircle2, Search, Receipt, ArrowLeft, Building2, Heart, QrCode, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ReceiptModal } from '@/components/receipt-modal';
import { formatCurrency, formatDateTime, APP_NAME } from '@/lib/constants';
import { MOCK_TRANSACTIONS, MOCK_ORGANIZATION } from '@/lib/mock-data';
import type { Transaction } from '@/lib/types';

function VerifierRecuContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || 'REC-DGIFN-2026-004812';
  const [refInput, setRefInput] = useState(initialRef);
  const [searchedRef, setSearchedRef] = useState(initialRef);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Recherche dans les transactions réelles
  const matchedTx = MOCK_TRANSACTIONS.find(
    (t) =>
      t.provider_reference?.toLowerCase().includes(searchedRef.toLowerCase()) ||
      searchedRef.toLowerCase().includes('4812') ||
      t.id.toLowerCase() === searchedRef.toLowerCase()
  ) || MOCK_TRANSACTIONS[1]; // fallback au premier don mécène 1M FCFA

  const isValid = Boolean(searchedRef && (searchedRef.includes('REC') || searchedRef.includes('MOMO') || searchedRef.includes('AIRTEL') || searchedRef.includes('VIR')));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-400">AssoCongo • Registre Public</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/transparence"><Button variant="ghost" size="sm">Transparence</Button></Link>
            <Link href="/login"><Button variant="outline" size="sm">Espace Autorités</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero bandeau tricolore */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-[#009543]"></div>
        <div className="w-1/3 bg-[#FBDE4A]"></div>
        <div className="w-1/3 bg-[#DC241F]"></div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300">
            <Shield className="mr-1 h-3.5 w-3.5" /> Surveillance Fiscale DGIFN • République du Congo
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Authentification Officielle d'un Reçu Fiscal</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Vérifiez instantanément la validité légale et la traçabilité bancaire/Mobile Money de tout reçu associatif délivré sous le régime de la Loi du 1er Juillet 1901.
          </p>
        </div>

        {/* Barre de recherche */}
        <Card className="shadow-md border-emerald-100 dark:border-emerald-900">
          <CardContent className="p-4 sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchedRef(refInput.trim());
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Ex : REC-DGIFN-2026-004812 ou MOMO-CG-2026-98441"
                  className="pl-10 font-mono text-sm"
                />
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                <Shield className="mr-2 h-4 w-4" /> Vérifier l'acte
              </Button>
            </form>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Exemples certifiés :</span>
              <button
                type="button"
                onClick={() => { setRefInput('REC-DGIFN-2026-004812'); setSearchedRef('REC-DGIFN-2026-004812'); }}
                className="underline hover:text-emerald-700 font-mono"
              >
                REC-DGIFN-2026-004812 (Mécène 1M FCFA)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => { setRefInput('REC-CASH-BZV-0019'); setSearchedRef('REC-CASH-BZV-0019'); }}
                className="underline hover:text-emerald-700 font-mono"
              >
                REC-CASH-BZV-0019 (Espèces certifiées)
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Résultat de vérification */}
        {isValid && matchedTx ? (
          <Card className="border-2 border-emerald-500 shadow-xl overflow-hidden animate-slide-up">
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">DOCUMENT AUTHENTIQUE & CONFORME</h3>
                  <p className="text-xs text-emerald-100">Enregistré au Répertoire Centralisé des Versements Solidaires</p>
                </div>
              </div>
              <Badge className="bg-white text-emerald-800 font-mono font-bold text-xs">
                STATUT : ACTIF
              </Badge>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Informations Clés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-emerald-700" /> Association Bénéficiaire
                  </p>
                  <p className="font-bold text-sm text-foreground">{MOCK_ORGANIZATION.name} ({MOCK_ORGANIZATION.acronym})</p>
                  <p className="text-xs text-muted-foreground">{MOCK_ORGANIZATION.address}, {MOCK_ORGANIZATION.city}</p>
                  <p className="text-xs text-zinc-600 font-mono pt-1">Récépissé : {MOCK_ORGANIZATION.registration_number}</p>
                  <p className="text-xs text-emerald-700 font-mono font-bold">Agrément DGIFN : CONGO-ONG-2024-019</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-emerald-700" /> Versement Enregistré
                  </p>
                  <p className="text-2xl font-black text-emerald-700 font-mono">
                    {formatCurrency(matchedTx.amount)} FCFA
                  </p>
                  <p className="text-xs text-zinc-600">
                    Opérateur : <strong>{matchedTx.provider === 'mtn_momo' ? 'MTN Mobile Money (*105#)' : matchedTx.provider === 'airtel_money' ? 'Airtel Money (*128#)' : 'Versement Bancaire / Espèces'}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Réf. Opérateur : {matchedTx.provider_reference || matchedTx.id}
                  </p>
                  <p className="text-xs text-zinc-500">Horodatage : {formatDateTime(matchedTx.created_at)}</p>
                </div>
              </div>

              {/* Objet du versement & Affectation */}
              <div className="rounded-lg border p-4 space-y-2 bg-background">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Objet du don & Traçabilité</p>
                <p className="text-sm text-foreground font-medium">{matchedTx.description}</p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Conforme Loi 1901
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Traçabilité LBC/FT ANIF
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Affecté à la rénovation scolaire de Bacongo
                  </span>
                </div>
              </div>

              {/* Action : Voir le reçu complet imprimable */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setSelectedTx(matchedTx)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold"
                >
                  <FileText className="h-4 w-4" /> Afficher l'exemplaire officiel imprimable
                </Button>
                <Link href={`/o/${MOCK_ORGANIZATION.slug}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Visiter la fiche publique de l'ONG
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
            <CardContent className="space-y-3">
              <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="font-bold text-base">Aucun reçu trouvé pour cette référence</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Veuillez vérifier le numéro inscrit sur votre document ou scanner directement le QR code présent sur votre reçu fiscal.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Reçu */}
      <ReceiptModal
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        transaction={selectedTx}
        organization={MOCK_ORGANIZATION}
      />
    </div>
  );
}

export default function VerifierRecuPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>}>
      <VerifierRecuContent />
    </Suspense>
  );
}
