
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Info } from 'lucide-react';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

interface Results {
    newApr: number;
    aprDifference: number;
    isCheaper: boolean;
    newMonthlyPayment: number;
    monthlySavings: number;
    monthsSaved: number;
    lifetimeSavings: number;
    upfrontCost: number;
    breakEvenMonths: number;
    currentLoanTermRemaining: number;
    currentTotalInterest: number;
    newTotalInterest: number;
}

export default function RefinanceCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;

  // Current Loan State
  const [remainingBalance, setRemainingBalance] = useState('250000');
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState('1800');
  const [currentInterestRate, setCurrentInterestRate] = useState('7');

  // New Loan State
  const [newLoanTerm, setNewLoanTerm] = useState('20');
  const [newInterestRate, setNewInterestRate] = useState('6');
  const [points, setPoints] = useState('2');
  const [costsAndFees, setCostsAndFees] = useState('1500');
  const [cashOutAmount, setCashOutAmount] = useState('0');
  
  const [currency, setCurrency] = useState<Currency>(globalCurrency);
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    setCurrency(globalCurrency);
  }, [globalCurrency]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateRefinance = () => {
    const p_current = parseFloat(remainingBalance) || 0;
    const r_current_monthly = (parseFloat(currentInterestRate) || 0) / 12 / 100;
    const a_current = parseFloat(currentMonthlyPayment) || 0;

    const pointsPercent = parseFloat(points) || 0;
    const fees = parseFloat(costsAndFees) || 0;
    const cashOut = parseFloat(cashOutAmount) || 0;

    const p_new_base = p_current + cashOut;
    const pointsCost = p_new_base * (pointsPercent / 100);
    const upfrontCost = pointsCost + fees;

    const p_new = p_new_base + upfrontCost;
    const r_new_monthly = (parseFloat(newInterestRate) || 0) / 12 / 100;
    const n_new = (parseInt(newLoanTerm) || 0) * 12;

    if (p_current <= 0 || a_current <=0 || r_current_monthly <=0 || p_new <= 0 || r_new_monthly <= 0 || n_new <= 0) {
      setResults(null);
      return;
    }
    
    // Calculate remaining term of current loan
    // n = -log(1 - (P * r) / A) / log(1 + r)
    const currentLoanTermRemaining = Math.round(-Math.log(1 - (p_current * r_current_monthly) / a_current) / Math.log(1 + r_current_monthly));
    const currentTotalPayment = a_current * currentLoanTermRemaining;
    const currentTotalInterest = currentTotalPayment - p_current;

    // Calculate new loan EMI
    const newEmi = (p_new * r_new_monthly * Math.pow(1 + r_new_monthly, n_new)) / (Math.pow(1 + r_new_monthly, n_new) - 1);
    const newTotalPayment = newEmi * n_new;
    const newTotalInterest = newTotalPayment - p_new;
    
    // Calculate new APR
    const totalCostOfNewLoan = newTotalInterest + upfrontCost;
    const newApr = ((totalCostOfNewLoan / p_new_base) / (n_new / 12)) * 100;

    const monthlySavings = a_current - newEmi;
    const lifetimeSavings = currentTotalPayment - newTotalPayment;
    const breakEvenMonths = upfrontCost > 0 && monthlySavings > 0 ? Math.ceil(upfrontCost / monthlySavings) : Infinity;

    setResults({
        newApr,
        aprDifference: parseFloat(currentInterestRate) - newApr,
        isCheaper: newApr < parseFloat(currentInterestRate),
        newMonthlyPayment: newEmi,
        monthlySavings,
        monthsSaved: currentLoanTermRemaining - n_new,
        lifetimeSavings,
        upfrontCost,
        breakEvenMonths,
        currentLoanTermRemaining,
        currentTotalInterest,
        newTotalInterest
    });
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Monthly Payment', Current: parseFloat(currentMonthlyPayment), New: results.newMonthlyPayment },
      { name: 'Total Interest', Current: results.currentTotalInterest, New: results.newTotalInterest },
    ];
  }, [results, currentMonthlyPayment]);
  
  const termData = useMemo(() => {
      if(!results) return [];
      return [
        { name: 'Loan Term', Current: results.currentLoanTermRemaining, New: parseInt(newLoanTerm) * 12 },
      ]
  },[results, newLoanTerm])


  const chartConfig = {
      Current: { label: 'Current Loan', color: 'hsl(var(--chart-5))' },
      New: { label: 'New Loan', color: 'hsl(var(--chart-2))' },
  }

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Refinance Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Mortgage Refinance Calculator</CardTitle>
              <CardDescription>
                Determine if refinancing your mortgage is the right choice for you and see potential savings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="mb-4">
                     <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                        <SelectTrigger id="currency" className="w-[180px]">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  
                  <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Current Loan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="rem-balance">Remaining balance ({currencySymbols[currency]})</Label>
                            <Input id="rem-balance" type="number" value={remainingBalance} onChange={(e) => setRemainingBalance(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cur-monthly-pay">Monthly payment ({currencySymbols[currency]})</Label>
                            <Input id="cur-monthly-pay" type="number" value={currentMonthlyPayment} onChange={(e) => setCurrentMonthlyPayment(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cur-interest-rate">Interest rate (%)</Label>
                            <Input id="cur-interest-rate" type="number" value={currentInterestRate} onChange={(e) => setCurrentInterestRate(e.target.value)} />
                        </div>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">New Loan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-loan-term">New loan term (years)</Label>
                            <Input id="new-loan-term" type="number" value={newLoanTerm} onChange={(e) => setNewLoanTerm(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-interest-rate">Interest rate (%)</Label>
                            <Input id="new-interest-rate" type="number" value={newInterestRate} onChange={(e) => setNewInterestRate(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="points" className="flex items-center gap-1">Points <UiTooltip><TooltipTrigger asChild><Info className="size-3"/></TooltipTrigger><TooltipContent><p>1 point = 1% of the loan amount, paid upfront to lower your interest rate.</p></TooltipContent></UiTooltip></Label>
                                <Input id="points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="costs-fees" className="flex items-center gap-1">Costs & fees ({currencySymbols[currency]}) <UiTooltip><TooltipTrigger asChild><Info className="size-3"/></TooltipTrigger><TooltipContent><p>Closing costs, appraisal fees, etc.</p></TooltipContent></UiTooltip></Label>
                                <Input id="costs-fees" type="number" value={costsAndFees} onChange={(e) => setCostsAndFees(e.target.value)} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="cash-out" className="flex items-center gap-1">Cash out amount ({currencySymbols[currency]}) <UiTooltip><TooltipTrigger asChild><Info className="size-3"/></TooltipTrigger><TooltipContent><p>Additional money borrowed against your home equity.</p></TooltipContent></UiTooltip></Label>
                            <Input id="cash-out" type="number" value={cashOutAmount} onChange={(e) => setCashOutAmount(e.target.value)} />
                        </div>
                    </CardContent>
                  </Card>
                   <Button onClick={calculateRefinance} className="w-full">Calculate Refinance</Button>
                </div>

                {results && (
                  <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Alert variant={results.lifetimeSavings > 0 ? "default" : "destructive"} className={results.lifetimeSavings > 0 ? 'border-green-500/50' : 'border-red-500/50'}>
                                <AlertTitle className={results.lifetimeSavings > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>{results.lifetimeSavings > 0 ? "Refinancing could be beneficial" : "Refinancing may not be beneficial"}</AlertTitle>
                                <AlertDescription>
                                    The APR for the new loan is {results.newApr.toFixed(3)}%, which is {Math.abs(results.aprDifference).toFixed(3)}% {results.aprDifference > 0 ? 'lower' : 'higher'} than the {currentInterestRate}% interest rate of the current loan.
                                </AlertDescription>
                            </Alert>
                             <div className="text-center rounded-lg border p-4">
                                <p className="text-sm text-muted-foreground">New Monthly Payment</p>
                                <p className="text-3xl font-bold text-primary">{formatCurrency(results.newMonthlyPayment)}</p>
                             </div>
                              <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Monthly Savings</p>
                                  <p className="text-xl font-semibold" style={{color: results.monthlySavings > 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}}>{formatCurrency(results.monthlySavings)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Lifetime Savings</p>
                                  <p className="text-xl font-semibold" style={{color: results.lifetimeSavings > 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}}>{formatCurrency(results.lifetimeSavings)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Upfront Cost</p>
                                  <p className="text-xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(results.upfrontCost)}</p>
                                </div>
                                <div className="rounded-lg border p-3">
                                  <p className="text-sm text-muted-foreground">Break-even Point</p>
                                  <p className="text-xl font-semibold">
                                    {isFinite(results.breakEvenMonths) ? `${results.breakEvenMonths} months` : 'N/A'}
                                  </p>
                                </div>
                              </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Loan Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Metric</th>
                                        <th className="text-right py-2">Current Loan</th>
                                        <th className="text-right py-2">New Loan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b"><td className="py-2">Principal Amount</td><td className="text-right py-2">{formatCurrency(parseFloat(remainingBalance))}</td><td className="text-right py-2">{formatCurrency(parseFloat(remainingBalance) + parseFloat(cashOutAmount))}</td></tr>
                                    <tr className="border-b"><td className="py-2">Monthly Payment</td><td className="text-right py-2">{formatCurrency(parseFloat(currentMonthlyPayment))}</td><td className="text-right py-2">{formatCurrency(results.newMonthlyPayment)}</td></tr>
                                    <tr className="border-b"><td className="py-2">Remaining Term</td><td className="text-right py-2">{results.currentLoanTermRemaining} mo</td><td className="text-right py-2">{parseInt(newLoanTerm) * 12} mo</td></tr>
                                    <tr className="border-b"><td className="py-2">Interest Rate/APR</td><td className="text-right py-2">{parseFloat(currentInterestRate).toFixed(3)}%</td><td className="text-right py-2">{results.newApr.toFixed(3)}%</td></tr>
                                    <tr className="border-b"><td className="py-2 text-red-600 dark:text-red-400">Total Interest</td><td className="text-right py-2 text-red-600 dark:text-red-400">{formatCurrency(results.currentTotalInterest)}</td><td className="text-right py-2 text-red-600 dark:text-red-400">{formatCurrency(results.newTotalInterest)}</td></tr>
                                    <tr><td className="py-2 font-semibold">Total Payments</td><td className="text-right py-2 font-semibold">{formatCurrency(results.currentTotalInterest + parseFloat(remainingBalance))}</td><td className="text-right py-2 font-semibold">{formatCurrency(results.newTotalInterest + parseFloat(remainingBalance) + parseFloat(cashOutAmount))}</td></tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                  </div>
                )}
              </div>
            </CardContent>
          </Card>

           {results && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Refinance Comparison Chart</CardTitle>
                <CardDescription>A visual comparison of key loan metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <BarChart data={chartData} >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                    <Tooltip content={<ChartTooltipContent formatter={(value, name) => formatCurrency(value as number)} />} />
                    <Legend />
                    <Bar dataKey="Current" fill="var(--color-Current)" radius={4} />
                    <Bar dataKey="New" fill="var(--color-New)" radius={4} />
                  </BarChart>
                </ChartContainer>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full mt-8">
                  <BarChart data={termData} >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${value} mo`} />
                    <Tooltip content={<ChartTooltipContent formatter={(value) => `${value} months`}/>} />
                    <Legend />
                    <Bar dataKey="Current" fill="var(--color-Current)" radius={4} />
                    <Bar dataKey="New" fill="var(--color-New)" radius={4} />
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
                        <AccordionTrigger>What is mortgage refinancing?</AccordionTrigger>
                        <AccordionContent>
                        Refinancing means replacing your existing mortgage with a new one. People typically refinance to get a lower interest rate, change their loan term (e.g., from 30 years to 15 years), or tap into their home equity for cash (a "cash-out" refinance).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What is APR (Annual Percentage Rate)?</AccordionTrigger>
                        <AccordionContent>
                        APR is the true cost of borrowing. It includes not only the interest rate but also any points, fees, and other charges associated with the loan. Comparing the APR of the new loan to the interest rate of your current loan gives a more accurate picture of potential savings.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What is the "break-even point"?</AccordionTrigger>
                        <AccordionContent>
                        The break-even point is the time it takes for your accumulated monthly savings to cover the upfront costs of refinancing. If you plan to sell your home before you reach the break-even point, refinancing might not be worth it.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What are "points"?</AccordionTrigger>
                        <AccordionContent>
                        Discount points are fees you pay the lender upfront in exchange for a lower interest rate. One point typically costs 1% of the loan amount. Paying points can be a good strategy if you plan to stay in the home for a long time.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger>When is a good time to refinance?</AccordionTrigger>
                        <AccordionContent>
                        A good time to refinance is when interest rates have dropped significantly since you got your original loan, or if your credit score has improved, which may qualify you for a better rate. You should also consider how long you plan to stay in the home to ensure you'll pass the break-even point.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Disclaimer: This calculator is for illustrative purposes only. Actual figures and qualification depend on your lender, credit score, and other factors. Consult a financial advisor for personalized advice.
                </p>
            </CardFooter>
           </Card>

        </div>
      </main>
    </TooltipProvider>
  );
}
