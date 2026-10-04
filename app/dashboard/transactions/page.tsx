'use client';

import { useEffect, useState, useMemo } from 'react';
import { Receipt, Download, TrendingUp, TrendingDown, Filter, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, formatDateTime, timeAgo, STATUS_LABELS, PROVIDER_LABELS, slugify } from '@/lib/constants';
import { MOCK_TRANSACTIONS } from '@/lib/mock-data';
import type { Transaction } from '@/lib/types';

export default function TransactionsPage() {
  const { currentOrg } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Tracabilite complete des flux financiers</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exporter CSV
        </Button>
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
                      <td className="p-3 text-xs text-muted-foreground">{t.provider_reference || '-'}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
