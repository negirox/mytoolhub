
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
};

const currencyLocales: Record<Currency, string> = {
    USD: 'en-US',
    INR: 'en-IN',
    EUR: 'de-DE',
};

const formatYearsAndMonths = (totalMonths: number) => {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return `${years} years, ${months} months`;
}

export default function MortgagePayoffCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;

  const [loanAmount, setLoanAmount] = useState('240000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTerm, setLoanTerm] = useState('30');
  const [extraPayment, setExtraPayment] = useState('200');
  const [currency, setCurrency] = useState<Currency>(globalCurrency);
  
  const [results, setResults] = useState<{
    originalTerm: number;
    newTerm: number;
    originalTotalInterest: number;
    newTotalInterest: number;
    interestSaved: number;
    payoffDate: string;
    newPayoffDate: string;
  } | null>(null);

  useEffect(() => {
    setCurrency(globalCurrency);
  }, [globalCurrency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculatePayoff = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n_original = parseFloat(loanTerm) * 12;
    const extra = parseFloat(extraPayment) || 0;

    if (p <= 0 || r <= 0 || n_original <= 0 || isNaN(p) || isNaN(r) || isNaN(n_original)) {
      setResults(null);
      return;
    }

    const emi = (p * r * Math.pow(1 + r, n_original)) / (Math.pow(1 + r, n_original) - 1);

    // Original loan calculation
    const originalTotalPayment = emi * n_original;
    const originalTotalInterest = originalTotalPayment - p;
    
    // New loan calculation with extra payments
    let balance = p;
    let months = 0;
    let totalInterestPaidWithExtra = 0;
    while (balance > 0) {
      const interestForMonth = balance * r;
      let principalForMonth = emi - interestForMonth;
      
      const totalPaymentThisMonth = emi + extra;
      
      if(balance < totalPaymentThisMonth - interestForMonth) {
          balance = 0;
      } else {
          balance -= (principalForMonth + extra);
      }
      
      totalInterestPaidWithExtra += interestForMonth;
      months++;
      if (months > n_original * 2) break; // Safety break
    }

    const interestSaved = originalTotalInterest - totalInterestPaidWithExtra;

    const today = new Date();
    const originalPayoffDate = new Date(new Date(today).setMonth(today.getMonth() + n_original));
    const newPayoffDate = new Date(new Date().setMonth(new Date().getMonth() + months));

    setResults({
        originalTerm: n_original,
        newTerm: months,
        originalTotalInterest,
        newTotalInterest: totalInterestPaidWithExtra,
        interestSaved,
        payoffDate: originalPayoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        newPayoffDate: newPayoffDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    });
  };
  
  useEffect(() => {
    calculatePayoff();
  }, [loanAmount, interestRate, loanTerm, extraPayment, currency]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      {
        name: 'Original Loan',
        'Total Interest': results.originalTotalInterest,
        'Loan Term (Months)': results.originalTerm,
      },
      {
        name: 'With Extra Payments',
        'Total Interest': results.newTotalInterest,
        'Loan Term (Months)': results.newTerm,
      },
    ];
  }, [results]);

  const chartConfig = {
    'Total Interest': { label: 'Total Interest', color: 'hsl(var(--chart-1))' },
    'Loan Term (Months)': { label: 'Loan Term (Months)', color: 'hsl(var(--chart-2))' },
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Mortgage Payoff Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Early Mortgage Payoff Calculator
              </CardTitle>
              <CardDescription>
                Find out how much time and interest you can save by making extra payments on your mortgage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                        <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan-amount">Current Loan Balance ({currencySymbols[currency]})</Label>
                    <Input
                      id="loan-amount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest">Interest Rate (% p.a.)</Label>
                    <Input
                      id="interest"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Remaining Loan Term (Years)</Label>
                    <Input
                      id="term"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="extra-payment">Monthly Extra Payment ({currencySymbols[currency]})</Label>
                    <Input
                      id="extra-payment"
                      type="number"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(e.target.value)}
                    />
                  </div>
                </div>

                {results && (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border p-4">
                     <h3 className="font-headline text-lg font-semibold">Payoff Summary</h3>
                     <div className="w-full space-y-3 text-center">
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">Interest Saved</p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(results.interestSaved)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm pt-4">
                            <div className="text-left">
                                <p className="font-semibold">Original Term</p>
                                <p>{formatYearsAndMonths(results.originalTerm)}</p>
                                <p className="text-xs text-muted-foreground">Payoff: {results.payoffDate}</p>
                            </div>
                             <div className="text-left">
                                <p className="font-semibold">New Term</p>
                                <p>{formatYearsAndMonths(results.newTerm)}</p>
                                <p className="text-xs text-muted-foreground">Payoff: {results.newPayoffDate}</p>
                            </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
           {results && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Loan Comparison</CardTitle>
                <CardDescription>Term length and total interest with and without extra payments.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                   <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                      <BarChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" tickFormatter={(val) => formatCurrency(val)} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" tickFormatter={(val) => `${val} mo`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <span>{name === 'Total Interest' ? formatCurrency(value as number) : `${value} months`}</span>} />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="Total Interest" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="Loan Term (Months)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
              </CardContent>
            </Card>
           )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do extra payments save me money?</AccordionTrigger>
                            <AccordionContent>
                                Extra payments go directly toward reducing your loan's principal balance. Since mortgage interest is calculated on the outstanding balance, a lower principal means you pay less interest with each subsequent payment. This effect compounds over time, leading to significant interest savings and a shorter loan term.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is it better to make extra monthly payments or one large annual payment?</AccordionTrigger>
                            <AccordionContent>
                                Both methods help, but making smaller, more frequent extra payments (like monthly) is often slightly better. This is because you reduce the principal balance sooner, which means less interest accrues. However, the most important thing is to be consistent with whichever method you choose.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Should I inform my lender before making extra payments?</AccordionTrigger>
                            <AccordionContent>
                                Yes, it's crucial. You must ensure your extra payments are applied directly to the loan's principal, not toward future interest. Contact your lender to understand their process. Some may require you to specify "apply to principal" on your payment.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Are there any prepayment penalties?</AccordionTrigger>
                            <AccordionContent>
                                Some loan agreements include a prepayment penalty clause, which charges a fee if you pay off a large portion or all of your loan within a specific period. Always check your loan documents or contact your lender to see if you have a prepayment penalty before making large extra payments.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Should I pay off my mortgage early or invest the extra money?</AccordionTrigger>
                            <AccordionContent>
                                This is a common financial debate. Paying off your mortgage offers a guaranteed, risk-free return equal to your loan's interest rate. Investing in the stock market could potentially yield higher returns, but it comes with risk. The right choice depends on your personal risk tolerance and financial goals.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
