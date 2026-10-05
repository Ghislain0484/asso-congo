'use client';

import { useEffect, useState, useMemo } from 'react';
import { Receipt, Download, TrendingUp, TrendingDown, Filter, Shield, FileText, FileCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReceiptModal } from '@/components/receipt-modal';
import { CerReportModal } from '@/components/cer-report-modal';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDateTime, timeAgo, STATUS_LABELS, PROVIDER_LABELS, slugify } from '@/lib/constants';
import { MOCK_TRANSACTIONS, MOCK_ORGANIZATION } from '@/lib/mock-data';
import type { Transaction } from '@/lib/types';

export default function TransactionsPage() {
  const { currentOrg, demoPersona } = useAuth();
  const effectiveOrg = currentOrg || MOCK_ORGANIZATION;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCerModal, setShowCerModal] = useState(false);

  useEffect(() => {
    if (!currentOrg) {
      setTransactions(MOCK_TRANSACTIONS);
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', currentOrg.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(200);
      if (data && data.length > 0) {
        setTransactions(data as Transaction[]);
      } else {
        setTransactions(MOCK_TRANSACTIONS);
      }
      setLoading(false);
    })();
  }, [currentOrg]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });
  }, [transactions, filterType, filterStatus]);

  const stats = useMemo(() => {
    const totalIn = filtered.filter((t) => t.status === 'success' && !['refund', 'payout'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
    const totalOut = filtered.filter((t) => t.status === 'success' && ['refund', 'payout'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
    const successCount = filtered.filter((t) => t.status === 'success').length;
    const failedCount = filtered.filter((t) => t.status === 'failed').length;
    return { totalIn, totalOut, successCount, failedCount };
  }, [filtered]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Montant', 'Devise', 'Statut', 'Provider', 'Reference', 'Description'];
    const rows = filtered.map((t) => [formatDateTime(t.created_at), t.type, t.amount, t.currency, t.status, t.provider || '', t.provider_reference || '', t.description || '']);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${slugify(currentOrg?.name || 'ong')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Bannière Adhérent (Grace Moukassa) */}
      {demoPersona === 'adherent' && (
        <Card className="border-emerald-500/40 bg-gradient-to-r from-emerald-950 via-slate-900 to-zinc-950 text-white shadow-md">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-emerald-400 font-bold">Vos Reçus Fiscaux Personnels</p>
              <h3 className="text-base font-bold text-white">Grace Moukassa • Donateur & Adhérente</h3>
              <p className="text-xs text-zinc-300">
                Vos versements (Don de 25 000 FCFA & Cotisation de 10 000 FCFA) ouvrent droit à une déduction fiscale certifiée DGIFN.
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500 text-emerald-300 text-xs shrink-0 font-medium">
              Loi du 1er Juillet 1901
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Bannière Régulateur (DGIFN) */}
      {demoPersona === 'regulator' && (
        <div className="rounded-xl border border-emerald-600/40 bg-emerald-50/50 p-4 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Registre National des Flux Financiers Associatifs</strong> • Surveillance en continu des seuils de vigilance ANIF et des reversements bancaires vers UBA Congo.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCerModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shrink-0"
          >
            <FileCheck className="h-3.5 w-3.5" /> Compte d'Emploi des Ressources (CER 2026)
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transactions & Traçabilité</h1>
          <p className="text-muted-foreground">Registre certifié des libéralités et reversements bancaires</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCerModal(true)}
            className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 gap-1.5 text-xs"
          >
            <FileCheck className="h-4 w-4" /> Rapport CER 2026
          </Button>
          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0} className="gap-1.5 text-xs">
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="mt-3 text-2xl font-bold text-success">{formatCurrency(stats.totalIn)} F</p>
            <p className="text-sm text-muted-foreground">Entrees totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <p className="mt-3 text-2xl font-bold text-destructive">{formatCurrency(stats.totalOut)} F</p>
            <p className="text-sm text-muted-foreground">Sorties totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.successCount}</p>
            <p className="text-sm text-muted-foreground">Transactions reussies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <p className="mt-3 text-2xl font-bold">{stats.failedCount}</p>
            <p className="text-sm text-muted-foreground">Transactions echouees</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
          <option value="all">Tous les types</option>
          <option value="donation">Dons</option>
          <option value="tip">Pourboires</option>
          <option value="membership_fee">Cotisations</option>
          <option value="event_fee">Frais evenements</option>
          <option value="refund">Remboursements</option>
          <option value="payout">Decaissements</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
          <option value="all">Tous les statuts</option>
          <option value="success">Reussi</option>
          <option value="pending">En attente</option>
          <option value="failed">Echoue</option>
          <option value="refunded">Rembourse</option>
        </select>
      </div>

      {/* Transactions table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Aucune transaction trouvee</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30 text-left">
                  <tr>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Montant</th>
                    <th className="p-3 font-medium">Provider</th>
                    <th className="p-3 font-medium">Reference</th>
                    <th className="p-3 font-medium">Statut</th>
                    <th className="p-3 font-medium text-right">Justificatif</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b transition-colors hover:bg-muted/20">
                      <td className="p-3 text-xs text-muted-foreground">{timeAgo(t.created_at)}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">{STATUS_LABELS[t.type] || t.type}</Badge>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${['refund', 'payout'].includes(t.type) ? 'text-destructive' : 'text-primary'}`}>
                          {['refund', 'payout'].includes(t.type) ? '-' : '+'}{formatCurrency(t.amount)} F
                        </span>
                      </td>
                      <td className="p-3 text-xs">{t.provider ? PROVIDER_LABELS[t.provider] || t.provider : '-'}</td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">{t.provider_reference || '-'}</td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={
                            t.status === 'success' ? 'border-success/30 bg-success/10 text-success' :
                            t.status === 'failed' ? 'border-destructive/30 bg-destructive/10 text-destructive' :
                            'border-warning/30 bg-warning/10 text-warning'
                          }
                        >
                          {STATUS_LABELS[t.status] || t.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTx(t)}
                          className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5" /> Reçu Fiscal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reçu Fiscal Modal */}
      <ReceiptModal
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
        transaction={selectedTx}
        organization={effectiveOrg}
      />

      {/* Compte d'Emploi des Ressources (CER 2026) Modal */}
      <CerReportModal
        open={showCerModal}
        onOpenChange={setShowCerModal}
        organization={effectiveOrg}
      />
    </div>
  );
}
