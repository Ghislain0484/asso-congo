'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, CheckCircle2, Smartphone, Loader2, Shield, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { formatCurrency, formatCurrencyWithSymbol, generateReceiptNumber } from '@/lib/constants';
import { ENABLED_PROVIDERS, processPayment, PAYMENT_PROVIDERS, DONATION_SUGGESTIONS, TIP_SUGGESTIONS } from '@/lib/payment';
import type { Organization, PaymentProvider } from '@/lib/types';

export default function DonationPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [tipAmount, setTipAmount] = useState(500);
  const [customTip, setCustomTip] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [provider, setProvider] = useState<PaymentProvider>('mtn_momo');
  const [paymentPhone, setPaymentPhone] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from('organizations').select('*').eq('slug', slug).maybeSingle();
      if (data) setOrg(data as Organization);
      setLoading(false);
    })();
  }, [slug]);

  const finalAmount = customAmount ? parseInt(customAmount) : amount;
  const finalTip = customTip ? parseInt(customTip) : tipAmount;
  const total = finalAmount + finalTip;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    if (finalAmount <= 0) {
      toast({ title: 'Montant invalide', description: 'Le montant du don doit etre superieur a 0', variant: 'destructive' });
      return;
    }
    if (!paymentPhone && provider !== 'cash') {
      toast({ title: 'Telephone requis', description: 'Veuillez saisir votre numero Mobile Money', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    try {
      const reference = generateReceiptNumber();
      const paymentResult = await processPayment({
        amount: total,
        currency: 'XAF',
        provider,
        phone: paymentPhone,
        reference,
        description: `Don pour ${org.name}`,
      });

      if (!paymentResult.success) {
        toast({ title: 'Paiement echoue', description: paymentResult.message, variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      const { data: donationData, error: donError } = await supabase
        .from('donations')
        .insert({
          organization_id: org.id,
          donor_name: isAnonymous ? 'Anonyme' : donorName || 'Anonyme',
          donor_email: donorEmail || null,
          donor_phone: donorPhone || null,
          donor_is_anonymous: isAnonymous,
          amount: finalAmount,
          tip_amount: finalTip,
          currency: 'XAF',
          message: message || null,
          status: 'completed',
          payment_provider: provider,
          receipt_number: reference,
        })
        .select()
        .single();

      if (donError) throw donError;

      await supabase.from('transactions').insert({
        organization_id: org.id,
        donation_id: donationData.id,
        type: 'donation',
        amount: finalAmount,
        currency: 'XAF',
        status: 'success',
        provider,
        provider_reference: paymentResult.providerReference,
        provider_transaction_id: paymentResult.providerTransactionId,
        provider_phone: paymentPhone || null,
        description: `Don de ${isAnonymous ? 'Anonyme' : donorName}`,
        processed_at: new Date().toISOString(),
      });

      if (finalTip > 0) {
        await supabase.from('transactions').insert({
          organization_id: org.id,
          donation_id: donationData.id,
          type: 'tip',
          amount: finalTip,
          currency: 'XAF',
          status: 'success',
          provider,
          provider_reference: paymentResult.providerReference,
          provider_transaction_id: paymentResult.providerTransactionId,
          description: `Pourboire volontaire`,
          processed_at: new Date().toISOString(),
        });
        await supabase.from('tips').insert({
          organization_id: org.id,
          donation_id: donationData.id,
          amount: finalTip,
          currency: 'XAF',
          status: 'completed',
          tipper_name: isAnonymous ? null : donorName,
          tipper_email: donorEmail || null,
        });
      }



      setSuccess(true);
      toast({ title: 'Don reussi!', description: `Merci pour votre don de ${formatCurrencyWithSymbol(total)}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du paiement';
      toast({ title: 'Erreur', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (!org) {
    return <div className="flex min-h-screen flex-col items-center justify-center"><h1 className="text-2xl font-bold">ONG introuvable</h1><Link href="/"><Button className="mt-4">Retour</Button></Link></div>;
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Don reussi !</h2>
            <p className="mb-4 text-muted-foreground">Merci pour votre contribution a {org.name}</p>
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold text-primary">{formatCurrencyWithSymbol(total)}</p>
              {finalTip > 0 && <p className="mt-1 text-xs text-muted-foreground">Dont {formatCurrency(finalTip)} F de pourboire</p>}
            </div>
            <p className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" /> Reu: {generateReceiptNumber()}
            </p>
            <Link href={`/o/${org.slug}`}>
              <Button className="w-full">Retour a la page de l'ONG</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/o/${org.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour a {org.name}
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold">Faire un don a {org.name}</h1>
          <p className="text-muted-foreground">Votre soutien fait la difference. 100% securise via Mobile Money.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Choisissez un montant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {DONATION_SUGGESTIONS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`rounded-lg border p-3 text-center font-medium transition-colors ${
                      amount === amt && !customAmount ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {formatCurrency(amt)}<br /><span className="text-xs opacity-70">FCFA</span>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customAmount">Ou un montant libre</Label>
                <Input id="customAmount" type="number" placeholder="Montant en FCFA" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Tip suggestion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Pourboire volontaire (optionnel)</CardTitle>
              <CardDescription>AssoCongo est gratuit pour les ONG. Votre pourboire finance la plateforme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {TIP_SUGGESTIONS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setTipAmount(t.value === -1 ? 0 : t.value); setCustomTip(t.value === -1 ? '' : ''); }}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                      tipAmount === t.value && !customTip ? 'border-secondary bg-secondary text-secondary-foreground' : 'border-border hover:border-secondary/50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {customTip !== '' || tipAmount === -1 ? (
                <div className="space-y-2">
                  <Label htmlFor="customTip">Montant libre du pourboire</Label>
                  <Input id="customTip" type="number" placeholder="0" value={customTip} onChange={(e) => setCustomTip(e.target.value)} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Donor info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Vos informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="donorName">Nom complet</Label>
                <Input id="donorName" placeholder="Votre nom" value={donorName} onChange={(e) => setDonorName(e.target.value)} disabled={isAnonymous} required={!isAnonymous} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donorEmail">Email</Label>
                  <Input id="donorEmail" type="email" placeholder="vous@exemple.cg" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorPhone">Telephone</Label>
                  <Input id="donorPhone" placeholder="+242 06 ..." value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded border-input" />
                Faire un don anonyme
              </label>
              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <textarea id="message" placeholder="Laissez un message de soutien..." value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Mode de paiement</CardTitle>
              <CardDescription>Choisissez votre operateur Mobile Money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ENABLED_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                      provider === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: p.color }}>
                      {p.logo}
                    </div>
                    <span className="text-xs font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
              {provider !== 'cash' && (
                <div className="space-y-2">
                  <Label htmlFor="paymentPhone">Numero {PAYMENT_PROVIDERS[provider].name}</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="paymentPhone" placeholder="+242 06 ..." value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)} className="pl-10" />
                  </div>
                  <p className="text-xs text-muted-foreground">Code USSD: {PAYMENT_PROVIDERS[provider].ussdCode}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Don a {org.name}</span>
                  <span className="font-bold">{formatCurrency(finalAmount)} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pourboire volontaire</span>
                  <span className="font-bold">{formatCurrency(finalTip)} F</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatCurrencyWithSymbol(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement du paiement...</>
            ) : (
              <><Heart className="mr-2 h-4 w-4" /> Donner {formatCurrencyWithSymbol(total)}</>
            )}
          </Button>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" /> Paiement securise. Tracabilite DGIFN. Reu automatique.
          </p>
        </form>
      </div>
    </div>
  );
}
