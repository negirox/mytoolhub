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
import { Terminal } from 'lucide-react';

const API_URL = 'https://api.exchangerate.host/latest';

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error('Failed to fetch currency list');
        }
        const data = await res.json();
        setCurrencies(Object.keys(data.rates));
      } catch (e: any) {
        setError(e.message);
      }
    };
    fetchCurrencies();
  }, []);

  const convertCurrency = useCallback(async () => {
    if (!amount) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `${API_URL}?base=${fromCurrency}&symbols=${toCurrency}&amount=${amount}`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch exchange rate.');
      }
      const data = await res.json();
      if (data.rates && data.rates[toCurrency]) {
        setResult(data.rates[toCurrency]);
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
                      {currencies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
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
                      {currencies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
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
                <Button variant="outline" onClick={handleSwapCurrencies}>
                  Swap
                </Button>
              </div>
              {result !== null && (
                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="font-headline text-lg font-semibold">
                    Result
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
