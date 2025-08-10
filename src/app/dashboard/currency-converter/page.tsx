
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ArrowRightLeft, Github } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import Link from 'next/link';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const CURRENCIES_URL =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
const EXCHANGE_RATE_URL_PREFIX =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

interface Currencies {
  [key: string]: string;
}

interface ConversionHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
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
  const [conversionHistory, setConversionHistory] = useState<
    ConversionHistory[]
  >([]);

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
    if (!amount || !fromCurrency || !toCurrency || !currencies[fromCurrency] || !currencies[toCurrency]) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setResult(null);
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult(numericAmount);
      setDate(new Date().toISOString().split('T')[0]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${EXCHANGE_RATE_URL_PREFIX}/${fromCurrency}.json`);
      if (!res.ok) {
        throw new Error('Failed to fetch exchange rate data.');
      }
      const data = await res.json();
      const rate = data[fromCurrency]?.[toCurrency];
      
      setDate(data.date);

      if (rate) {
        const conversionResult = numericAmount * rate;
        setResult(conversionResult);
        
        const newHistoryEntry: ConversionHistory = {
            id: `${fromCurrency}-${toCurrency}-${Date.now()}`,
            from: fromCurrency.toUpperCase(),
            to: toCurrency.toUpperCase(),
            amount: numericAmount,
            result: conversionResult,
            rate: rate
        };

        setConversionHistory(prev => [newHistoryEntry, ...prev].slice(0, 10));

      } else {
        throw new Error('Could not find rate for the selected currency pair.');
      }
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [amount, fromCurrency, toCurrency, currencies]);
  
  useEffect(() => {
    convertCurrency();
  }, [amount, fromCurrency, toCurrency, convertCurrency]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const currencyOptions = useMemo(() => {
    return Object.entries(currencies)
      .map(([code, name]) => ({
        value: code,
        label: `${code.toUpperCase()} - ${name}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [currencies]);

  const chartData = useMemo(() => {
    return conversionHistory.map(item => ({
        name: `${item.from} to ${item.to}`,
        result: item.result,
        rate: item.rate,
        label: `${item.amount.toLocaleString()} ${item.from} = ${item.result.toLocaleString(undefined, {maximumFractionDigits: 2})} ${item.to}`
    })).reverse();
  }, [conversionHistory]);

  const chartConfig = {
    result: {
      label: "Result",
      color: "hsl(var(--chart-1))",
    },
    rate: {
        label: "Exchange Rate",
        color: "hsl(var(--chart-2))",
    }
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
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
                Get real-time exchange rates from a free, open-source API. The conversion will happen automatically.
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
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-2">
                  <Label>From</Label>
                   <Combobox
                    options={currencyOptions}
                    value={fromCurrency}
                    onValueChange={setFromCurrency}
                    placeholder="From currency"
                    searchPlaceholder="Search currency..."
                  />
                </div>
                <div className="flex items-end">
                    <Button variant="outline" onClick={handleSwapCurrencies} size="icon" className="self-end">
                      <ArrowRightLeft className="size-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                   <Combobox
                    options={currencyOptions}
                    value={toCurrency}
                    onValueChange={setToCurrency}
                    placeholder="To currency"
                    searchPlaceholder="Search currency..."
                  />
                </div>
                 <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.00"
                  />
                </div>
              </div>
              
              {isLoading && <p className="mt-4 text-sm text-muted-foreground">Converting...</p>}
              {result !== null && !isLoading && (
                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="font-headline text-lg font-semibold">
                    Result
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {parseFloat(amount).toLocaleString()} {fromCurrency.toUpperCase()} = {result.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })} {toCurrency.toUpperCase()}
                  </p>
                  {date && <p className="text-sm text-muted-foreground mt-2">Last updated on: {date}</p>}
                </div>
              )}
            </CardContent>
          </Card>
          {conversionHistory.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Conversion History</CardTitle>
                    <CardDescription>Last 10 conversion results.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5, }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="result" name="Conversion Result" fill="var(--color-result)" radius={4} />
                            <Bar dataKey="rate" name="Exchange Rate" fill="var(--color-rate)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
             </Card>
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}
