
'use client';

import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pie, PieChart, Cell, Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Amortization Calculator',
//   description: 'Generate a detailed loan amortization schedule to see a breakdown of your payments, principal, and interest over time.',
// };


interface MonthlyAmortizationData {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
}
interface AmortizationYear {
  year: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
  loanPaidToDate: number;
  monthlyData: MonthlyAmortizationData[];
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
};

const currencyLocales: Record<Currency, string> = {
    USD: 'en-US',
    INR: 'en-IN',
    EUR: 'de-DE', // Using German locale for Euro formatting
};

export default function AmortizationCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;

  const [loanAmount, setLoanAmount] = useState('240000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTerm, setLoanTerm] = useState('30');
  const [currency, setCurrency] = useState<Currency>(globalCurrency);
  
  useEffect(() => {
      setCurrency(globalCurrency);
  }, [globalCurrency]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  }, [currency]);

  const { amortizationData, totalInterest, totalPrincipal } = useMemo(() => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(loanTerm) * 12;

    if (p <= 0 || r < 0 || n <= 0 || isNaN(p) || isNaN(r) || isNaN(n)) {
      return { amortizationData: [], totalInterest: 0, totalPrincipal: 0 };
    }

    const emiValue = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p/n;
    
    let balance = p;
    let interestSoFar = 0;
    const yearlyData: { [key: number]: Omit<AmortizationYear, 'year' | 'balance' | 'loanPaidToDate'> & {monthlyData: MonthlyAmortizationData[]} } = {};

    for (let month = 1; month <= n; month++) {
      const interestForMonth = balance * r;
      let principalForMonth = emiValue - interestForMonth;
      
      if (balance <= principalForMonth) {
          principalForMonth = balance;
      }
      balance -= principalForMonth;
      interestSoFar += interestForMonth;

      const year = Math.ceil(month / 12);
      if (!yearlyData[year]) {
        yearlyData[year] = { principal: 0, interest: 0, totalPayment: 0, monthlyData: [] };
      }
      
      yearlyData[year].principal += principalForMonth;
      yearlyData[year].interest += interestForMonth;
      yearlyData[year].totalPayment += emiValue;
      yearlyData[year].monthlyData.push({
          month: month,
          principal: principalForMonth,
          interest: interestForMonth,
          totalPayment: emiValue,
          balance: balance
      });
    }

    let cumulativePaid = 0;
    const schedule: AmortizationYear[] = Object.keys(yearlyData).map((yearStr) => {
        const year = parseInt(yearStr);
        const data = yearlyData[year];
        cumulativePaid += data.principal;
        return {
            year,
            principal: data.principal,
            interest: data.interest,
            totalPayment: data.totalPayment,
            balance: data.monthlyData[data.monthlyData.length-1].balance,
            loanPaidToDate: (cumulativePaid / p) * 100,
            monthlyData: data.monthlyData,
        };
    });

    return { amortizationData: schedule, totalInterest: interestSoFar, totalPrincipal: p };
  }, [loanAmount, interestRate, loanTerm]);

  const AmortizationRow = ({ row }: { row: AmortizationYear }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <>
        <TableRow className="bg-muted/50 hover:bg-muted">
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="size-6"
            >
              {isOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
            {row.year}
          </TableCell>
          <TableCell>{formatCurrency(row.principal)}</TableCell>
          <TableCell>{formatCurrency(row.interest)}</TableCell>
          <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
          <TableCell>{formatCurrency(row.balance)}</TableCell>
          <TableCell className="text-right">
            {row.loanPaidToDate.toFixed(2)}%
          </TableCell>
        </TableRow>
        <Collapsible open={isOpen} asChild>
          <CollapsibleContent asChild>
            <tr className="bg-background">
              <TableCell colSpan={6} className="p-0">
                <div className="p-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Total Payment</TableHead>
                        <TableHead>Ending Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {row.monthlyData.map((monthData) => (
                        <TableRow key={monthData.month}>
                          <TableCell>{monthData.month}</TableCell>
                          <TableCell>
                            {formatCurrency(monthData.principal)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(monthData.interest)}
                          </TableCell>
                           <TableCell>
                            {formatCurrency(monthData.totalPayment)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(monthData.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TableCell>
            </tr>
          </CollapsibleContent>
        </Collapsible>
      </>
    );
  };
  
   const chartConfig = {
    principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
    interest: { label: 'Interest', color: 'hsl(var(--chart-1))' },
  };

  const pieChartData = useMemo(() => ([
    { name: 'principal', value: totalPrincipal, fill: 'var(--color-principal)' },
    { name: 'interest', value: totalInterest, fill: 'var(--color-interest)' }
  ]), [totalPrincipal, totalInterest]);


  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Amortization Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Loan Amortization Schedule
              </CardTitle>
              <CardDescription>
                See a detailed breakdown of your loan payments over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="mb-6 max-w-xs">
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
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Loan Amount ({currencySymbols[currency]})</Label>
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
                  <Label htmlFor="term">Loan Term (Years)</Label>
                  <Input
                    id="term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

            {amortizationData.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="font-headline">Year-wise Payment Breakdown</CardTitle>
                    <CardDescription>Visualizing how your payments of principal and interest change over time.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <AreaChart accessibilityLayer data={amortizationData} margin={{ left: 12, right: 12, top: 20 }}>
                          <CartesianGrid vertical={false} />
                           <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `Year ${value}`} />
                           <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                           <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value, name) => <span>{formatCurrency(value as number)}</span>} />} />
                           <ChartLegend content={<ChartLegendContent />} />
                           <Area dataKey="principal" type="natural" fill="var(--color-principal)" fillOpacity={0.7} stroke="var(--color-principal)" stackId="a" />
                           <Area dataKey="interest" type="natural" fill="var(--color-interest)" fillOpacity={0.7} stroke="var(--color-interest)" stackId="a" />
                        </AreaChart>
                     </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-headline">Total Payment Breakdown</CardTitle>
                    <CardDescription>Principal vs. Interest over the full loan term.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-sm">
                       <PieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                          <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                            {pieChartData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                          </Pie>
                          <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                       </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {amortizationData.length > 0 && (
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Amortization Table</CardTitle>
                    <CardDescription>Yearly and monthly breakdown of your loan payments.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead>Principal Paid</TableHead>
                        <TableHead>Interest Paid</TableHead>
                        <TableHead>Total Payment</TableHead>
                        <TableHead>Ending Balance</TableHead>
                        <TableHead className="text-right">Loan Paid To Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {amortizationData.map((row) => (
                        <AmortizationRow key={row.year} row={row} />
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
                </Card>
            )}
            
            <Card>
                <CardHeader><CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle></CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>What is loan amortization?</AccordionTrigger>
                            <AccordionContent>
                                Loan amortization is the process of spreading out a loan into a series of fixed payments over time. A portion of each payment goes toward the loan's principal (the amount you borrowed) and a portion goes toward interest. For example, a $1,000 payment on a mortgage might include $300 towards principal and $700 towards interest.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>Why do I pay more interest at the beginning of my loan?</AccordionTrigger>
                            <AccordionContent>
                                In the early years of a loan, the outstanding principal balance is at its highest. Since interest is calculated on the current balance, the interest component of your payment is larger at the start. As you pay down the principal, the interest portion of each payment decreases, and more of your payment goes towards the principal. For a 30-year mortgage, it might take over a decade for the principal portion of your payment to become larger than the interest portion.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>How can I use this amortization schedule?</AccordionTrigger>
                            <AccordionContent>
                                You can use this schedule to understand exactly where your money is going with each payment. It helps you see how much you'll pay in total interest over the life of the loan and visualize your progress in paying down your debt. It's also useful for tax purposes, as mortgage interest is often tax-deductible.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>What is an amortization schedule?</AccordionTrigger>
                            <AccordionContent>
                            An amortization schedule is a table detailing each periodic payment on a loan. It breaks down each payment into its principal and interest components and shows the remaining balance of the loan after each payment is made. This calculator provides a yearly and monthly schedule to give you both a high-level overview and a detailed breakdown.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                            <AccordionTrigger>Can I pay off my loan faster?</AccordionTrigger>
                            <AccordionContent>
                                Yes. Making extra payments directly towards the principal can help you pay off your loan faster and save a significant amount on total interest. For example, paying an extra $100 per month on a $200,000, 30-year loan at 6% interest could save you over $50,000 and help you pay off the loan nearly 5 years earlier. Check our "EMI Calculator" for a prepayment feature to see how this works.
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
