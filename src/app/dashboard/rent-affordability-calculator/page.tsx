
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Metadata } from 'next';

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

export default function RentAffordabilityCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;

  const [annualIncome, setAnnualIncome] = useState('80000');
  const [monthlyDebt, setMonthlyDebt] = useState('0');
  const [currency, setCurrency] = useState<Currency>(globalCurrency);
  
  const [results, setResults] = useState<{
    conservative: number;
    moderate: number;
    aggressive: number;
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
  
  const calculateRent = () => {
    const income = parseFloat(annualIncome) || 0;
    const debt = parseFloat(monthlyDebt) || 0;

    if (income <= 0) {
        setResults(null);
        return;
    }

    const monthlyIncome = income / 12;
    
    // Using the 36% DTI rule as a cap
    const maxTotalMonthlyPayments = monthlyIncome * 0.36;
    const maxAffordableRentBasedOnDTI = maxTotalMonthlyPayments - debt;

    const rentRanges = {
      conservative: Math.min(monthlyIncome * 0.25, maxAffordableRentBasedOnDTI),
      moderate: Math.min(monthlyIncome * 0.30, maxAffordableRentBasedOnDTI),
      aggressive: Math.min(monthlyIncome * 0.35, maxAffordableRentBasedOnDTI),
    };

    setResults({
        conservative: Math.max(0, rentRanges.conservative),
        moderate: Math.max(0, rentRanges.moderate),
        aggressive: Math.max(0, rentRanges.aggressive),
    });
  }

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Conservative (25%)', rent: results.conservative, fill: 'hsl(var(--chart-2))' },
      { name: 'Moderate (30%)', rent: results.moderate, fill: 'hsl(var(--chart-3))' },
      { name: 'Aggressive (35%)', rent: results.aggressive, fill: 'hsl(var(--chart-5))' },
    ];
  }, [results]);

  const chartConfig = {
    rent: {
      label: `Affordable Rent (${currencySymbols[currency]})`,
    },
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Rent Affordability Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">How Much Rent Can You Afford?</CardTitle>
              <CardDescription>
                Estimate your affordable monthly rental spending based on your income and debt level. Modify the values and click the calculate button to use.
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
                    <Label htmlFor="annual-income">Your Pre-tax Annual Income</Label>
                    <Input id="annual-income" type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-debt">Your Monthly Debt Payback</Label>
                    <Input id="monthly-debt" type="number" value={monthlyDebt} onChange={(e) => setMonthlyDebt(e.target.value)} placeholder="Car, student loan, etc." />
                  </div>
                  <Button onClick={calculateRent} className="w-full md:w-auto">Calculate</Button>
                </div>
                {results && (
                  <div className="flex flex-col items-center justify-center rounded-lg border p-4 md:p-6">
                    <h3 className="mb-4 text-center font-headline text-lg font-semibold">Your Recommended Monthly Rent</h3>
                    <div className="w-full space-y-3 text-center">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Moderate Budget (30% Rule)</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(results.moderate)}</p>
                         <p className="text-xs text-muted-foreground">per month</p>
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
                    <CardTitle className="font-headline">Rent Budget Comparison</CardTitle>
                    <CardDescription>This chart shows different rent budgets based on common financial guidelines.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                      <Tooltip 
                        cursor={false} 
                        content={<ChartTooltipContent 
                            formatter={(value) => formatCurrency(value as number)}
                            indicator='dot'
                        />} 
                      />
                      <Bar dataKey="rent" radius={5}>
                        <LabelList
                            dataKey="rent"
                            position="top"
                            offset={8}
                            className="fill-foreground font-semibold"
                            formatter={(value: number) => formatCurrency(value)}
                        />
                      </Bar>
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
                    <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is the 30% rule for rent?</AccordionTrigger>
                        <AccordionContent>
                        The 30% rule is a popular financial guideline suggesting you should spend no more than 30% of your gross monthly income on rent. This helps ensure you have enough money left for other expenses like utilities, food, transportation, savings, and debt repayment.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Should I use my gross or net income to calculate rent?</AccordionTrigger>
                        <AccordionContent>
                         This calculator and most standard guidelines use your gross (pre-tax) income. This is the amount you earn before any taxes or deductions are taken out. Landlords also typically look at gross income when evaluating your rental application.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is a Debt-to-Income (DTI) ratio?</AccordionTrigger>
                        <AccordionContent>
                        Your Debt-to-Income (DTI) ratio compares your total monthly debt payments to your gross monthly income. Landlords use it to assess your ability to make rent payments reliably. A common DTI limit for housing is 36%, meaning your rent plus all other debts shouldn't exceed 36% of your income. Our calculator caps the recommendation at this DTI level.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What other costs should I consider besides rent?</AccordionTrigger>
                        <AccordionContent>
                        Your total housing cost is more than just the rent. Remember to budget for utilities (electricity, gas, water, internet), renter's insurance, parking fees, pet fees, and moving costs. These should be factored into your overall budget.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Is it always bad to spend more than 30% on rent?</AccordionTrigger>
                        <AccordionContent>
                        Not necessarily. In high-cost-of-living areas, it might be difficult to stay under 30%. If you have no debt, low transportation costs (e.g., you work from home or walk to work), and are frugal in other areas, you might comfortably afford a higher percentage. The 30% rule is a guideline, not a strict rule.
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
