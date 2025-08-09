'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ArrowRightLeft } from 'lucide-react';

const CURRENCIES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
const EXCHANGE_RATE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

interface Currencies {
  [key: string]: string;
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('usd');
  const [toCurrency, setToCurrency] = useState('eur');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState<Currencies>({});
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch(CURRENCIES_URL);
        if (!res.ok) throw new Error('Failed to fetch currencies.');
        const data: Currencies = await res.json();
        setCurrencies(data);
      } catch (e: any) {
        setError('Could not load currency list.');
      }
    };
    fetchCurrencies();
  }, []);

  const convertCurrency = useCallback(async () => {
    if (!amount || !fromCurrency || !toCurrency) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${EXCHANGE_RATE_URL}/${fromCurrency}.json`);
      if (!res.ok) {
        throw new Error('Failed to fetch exchange rate.');
      }
      const data = await res.json();
      
      const rate = data[fromCurrency]?.[toCurrency];
      setDate(data.date);

      if (rate) {
        const numericAmount = parseFloat(amount);
        setResult(numericAmount * rate);
      } else {
        throw new Error('Could not find rate for the selected currency.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };
  
  const currencyOptions = Object.entries(currencies).map(([code, name]) => ({
    code: code,
    name: name,
  })).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
        <h1 className="font-headline text-xl font-semibold">
          Currency Converter
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Currency Converter</CardTitle>
              <CardDescription>
                Get real-time exchange rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="From currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code.toUpperCase()} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="To currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                           {c.code.toUpperCase()} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={convertCurrency} disabled={isLoading}>
                  {isLoading ? 'Converting...' : 'Convert'}
                </Button>
                <Button variant="outline" onClick={handleSwapCurrencies} size="icon">
                  <ArrowRightLeft className="size-4" />
                </Button>
              </div>
              {result !== null && (
                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="font-headline text-lg font-semibold">
                    Result
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {amount} {fromCurrency.toUpperCase()} = {result.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} {toCurrency.toUpperCase()}
                  </p>
                  {date && <p className="text-sm text-muted-foreground mt-2">Last updated on: {date}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
