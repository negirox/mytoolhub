
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Pie, PieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
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
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';

const GST_RATE = 0.18; // 18% GST

const currencyLocales: Record<Currency, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
};

const currencySymbols: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};


interface MonthlyAmortizationData {
  month: number;
  principal: number;
  interest: number;
  gstOnInterest: number;
  totalPayment: number;
  balance: number;
}

interface AmortizationYear {
  year: number;
  principal: number;
  interest: number;
  gstOnInterest: number;
  totalPayment: number;
  balance: number;
  loanPaidToDate: number;
  monthlyData: MonthlyAmortizationData[];
}

export default function CreditCardEmiCalculatorPage() {
    const currencyContext = useContext(CurrencyContext);
    if (!currencyContext) {
        throw new Error('useContext must be used within a CurrencyProvider');
    }
    const { globalCurrency } = currencyContext;

  const [amount, setAmount] = useState('15000');
  const [rate, setRate] = useState('18');
  const [tenure, setTenure] = useState('6');
  const [fees, setFees] = useState('300');
  const [currency, setCurrency] = useState<Currency>(globalCurrency);


  const [results, setResults] = useState({
    monthlyEmi: 0,
    apr: 0,
    processingFeeGst: 0,
    totalInterest: 0,
    gstOnInterest: 0,
    totalPayments: 0,
  });

  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationYear[]>([]);

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

  const calculateEmi = () => {
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 12 / 100; // Monthly interest rate
    const n = parseInt(tenure);
    const procFees = parseFloat(fees) || 0;

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r < 0 || n <= 0) {
      setAmortizationSchedule([]);
      setResults({
        monthlyEmi: 0,
        apr: 0,
        processingFeeGst: 0,
        totalInterest: 0,
        gstOnInterest: 0,
        totalPayments: 0,
      });
      return;
    }

    const emiPrincipalAndInterest = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    let balance = p;
    let totalInterest = 0;
    let totalGstOnInterest = 0;
    const yearlyData: { [key: number]: Omit<AmortizationYear, 'year' | 'balance' | 'loanPaidToDate'> & {monthlyData: MonthlyAmortizationData[]} } = {};

    for (let month = 1; month <= n; month++) {
      const interestForMonth = balance * r;
      let principalForMonth = emiPrincipalAndInterest - interestForMonth;
      const gstForMonth = interestForMonth * GST_RATE;
      
      if (balance <= principalForMonth) {
          principalForMonth = balance;
      }
      balance -= principalForMonth;
      
      totalInterest += interestForMonth;
      totalGstOnInterest += gstForMonth;

      const year = Math.ceil(month / 12);
      if (!yearlyData[year]) {
          yearlyData[year] = { principal: 0, interest: 0, gstOnInterest: 0, totalPayment: 0, monthlyData: [] };
      }
      
      yearlyData[year].principal += principalForMonth;
      yearlyData[year].interest += interestForMonth;
      yearlyData[year].gstOnInterest += gstForMonth;
      yearlyData[year].totalPayment += principalForMonth + interestForMonth + gstForMonth;
      
      yearlyData[year].monthlyData.push({
          month: month,
          principal: principalForMonth,
          interest: interestForMonth,
          gstOnInterest: gstForMonth,
          totalPayment: principalForMonth + interestForMonth + gstForMonth,
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
            gstOnInterest: data.gstOnInterest,
            totalPayment: data.totalPayment,
            balance: data.monthlyData[data.monthlyData.length-1].balance,
            loanPaidToDate: (cumulativePaid / p) * 100,
            monthlyData: data.monthlyData,
        };
    });
    setAmortizationSchedule(schedule);

    const processingFeeWithGst = procFees * (1 + GST_RATE);
    const monthlyEmi = emiPrincipalAndInterest + (totalGstOnInterest / n);
    const totalPayments = p + totalInterest + totalGstOnInterest + processingFeeWithGst;
    
    // APR Calculation
    const totalFeesAndInterest = totalInterest + procFees;
    const tenureInYears = n / 12;
    const apr = (totalFeesAndInterest / p) * (1 / tenureInYears) * 100;

    setResults({
      monthlyEmi: monthlyEmi,
      apr: apr,
      processingFeeGst: processingFeeWithGst,
      totalInterest: totalInterest,
      gstOnInterest: totalGstOnInterest,
      totalPayments: totalPayments,
    });
  };
  
  useEffect(() => {
    calculateEmi();
  }, [amount, rate, tenure, fees, currency]);

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
          <TableCell>{formatCurrency(row.gstOnInterest)}</TableCell>
          <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
          <TableCell>{formatCurrency(row.balance)}</TableCell>
          <TableCell className="text-right">
            {row.loanPaidToDate.toFixed(2)}%
          </TableCell>
        </TableRow>
        <Collapsible open={isOpen} asChild>
          <CollapsibleContent asChild>
            <tr className="bg-background">
              <TableCell colSpan={7} className="p-0">
                <div className="p-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>GST on Interest</TableHead>
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
                            {formatCurrency(monthData.gstOnInterest)}
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
      fees: { label: 'Total Fees & GST', color: 'hsl(var(--chart-5))' },
      gstOnInterest: { label: 'GST on Interest', color: 'hsl(var(--chart-5))' },
  };

  const pieChartData = useMemo(() => {
      const principalAmount = parseFloat(amount) || 0;
      const totalFees = results.processingFeeGst + results.gstOnInterest;
      return [
        { name: 'principal', value: principalAmount, fill: 'var(--color-principal)' },
        { name: 'interest', value: results.totalInterest, fill: 'var(--color-interest)' },
        { name: 'fees', value: totalFees, fill: 'var(--color-fees)' },
      ];
  }, [amount, results]);

  const monthlyChartData = useMemo(() => {
    if (!amortizationSchedule.length) return [];
    return amortizationSchedule.flatMap(year => year.monthlyData);
  }, [amortizationSchedule]);


  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">
          Credit Card EMI Calculator
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Credit Card EMI Calculator with GST
              </CardTitle>
              <CardDescription>
                Calculate your monthly EMI for credit card purchases, including processing fees and GST.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Credit Card Loan Details</h3>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INR">INR (₹)</SelectItem>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                   <div className="space-y-2">
                    <Label htmlFor="amount">Transaction Amount ({currencySymbols[currency]})</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="rate">Interest Rate (% p.a.)</Label>
                    <Input id="rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="tenure">Tenure (months)</Label>
                    <Input id="tenure" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="fees" className="flex items-center gap-1">Processing Fees (pre-GST) ({currencySymbols[currency]}) 
                        <Tooltip>
                            <TooltipTrigger asChild><Info className="size-3" /></TooltipTrigger>
                            <TooltipContent><p>One-time fee charged by the bank, before GST is applied.</p></TooltipContent>
                        </Tooltip>
                    </Label>
                    <Input id="fees" type="number" value={fees} onChange={(e) => setFees(e.target.value)} />
                  </div>
                  <Button onClick={calculateEmi} className="w-full md:w-auto">Recalculate</Button>
                </div>
                 <div className="flex flex-col gap-4">
                    <Card className="bg-muted/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">Monthly EMI (incl. GST on Interest)</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(results.monthlyEmi)}</span>
                            </div>
                             <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">Annual Percentage Rate (APR)†</span>
                                <span className="text-lg font-semibold">{results.apr.toFixed(2)} %</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">†APR calculation excludes GST on interest component for standard representation.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-lg">Total of all Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                           <div className="flex justify-between">
                             <span>Transaction Amount</span>
                             <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
                           </div>
                           <div className="flex justify-between">
                             <span>Processing Fees + GST</span>
                             <span className="font-medium">{formatCurrency(results.processingFeeGst)}</span>
                           </div>
                           <div className="flex justify-between">
                             <span>Total Interest Payable</span>
                             <span className="font-medium">{formatCurrency(results.totalInterest)}</span>
                           </div>
                           <div className="flex justify-between">
                             <span>GST on Interest</span>
                             <span className="font-medium">{formatCurrency(results.gstOnInterest)}</span>
                           </div>
                           <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                             <span>Total Cost</span>
                             <span className="text-primary">{formatCurrency(results.totalPayments)}</span>
                           </div>
                        </CardContent>
                     </Card>
                 </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Cost Breakdown</CardTitle>
                  <CardDescription>A visual breakdown of your total payment.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-sm">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                              {pieChartData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Monthly Payment Breakdown</CardTitle>
                  <CardDescription>Visual breakdown of each EMI payment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                      <BarChart data={monthlyChartData} accessibilityLayer>
                          <CartesianGrid vertical={false} />
                          <XAxis 
                              dataKey="month" 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => `M${value}`} 
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value as number)}
                          />
                          <ChartTooltip 
                            cursor={false}
                            content={<ChartTooltipContent formatter={(value, name) => <span>{formatCurrency(value as number)}</span>} />} 
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                          <Bar dataKey="principal" stackId="a" fill="var(--color-principal)" name="Principal" radius={4} />
                          <Bar dataKey="interest" stackId="a" fill="var(--color-interest)" name="Interest" radius={4} />
                          <Bar dataKey="gstOnInterest" stackId="a" fill="var(--color-fees)" name="GST on Interest" radius={4} />
                      </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {amortizationSchedule.length > 0 && (
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Amortization Schedule</CardTitle>
                    <CardDescription>Yearly and monthly breakdown of your EMI payments.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead>Principal (A)</TableHead>
                        <TableHead>Interest (B)</TableHead>
                        <TableHead>GST on Interest (C)</TableHead>
                        <TableHead>Total Payment (A+B+C)</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">Loan Paid To Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {amortizationSchedule.map((row) => (
                        <AmortizationRow key={row.year} row={row} />
                        ))}
                    </TableBody>
                    </Table>
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
                        <AccordionTrigger>How is Credit Card EMI different from a regular loan EMI?</AccordionTrigger>
                        <AccordionContent>
                        Credit Card EMIs often come with higher interest rates than traditional personal loans. They also involve processing fees and GST on those fees, as well as GST on the interest component of each EMI, which this calculator accounts for.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is APR (Annual Percentage Rate)?</AccordionTrigger>
                        <AccordionContent>
                        APR represents the true annual cost of your loan, including the interest rate and any pre-GST processing fees. It gives you a more complete picture of the loan's cost than the interest rate alone.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Why is GST charged on Credit Card EMIs?</AccordionTrigger>
                        <AccordionContent>
                        The Indian government classifies credit card services as a financial service, which is subject to GST. This tax is applied to the processing fee at the time of conversion and to the interest portion of every monthly installment you pay.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Can I foreclose my Credit Card EMI?</AccordionTrigger>
                        <AccordionContent>
                        Yes, most banks allow you to foreclose (pay off early) your Credit Card EMI. However, they usually charge a foreclosure fee and require you to pay the outstanding principal along with any accrued interest and applicable GST.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Does converting a purchase to EMI affect my credit score?</AccordionTrigger>
                        <AccordionContent>
                        Converting a large purchase into EMIs and paying them on time can positively affect your credit score as it demonstrates responsible credit behavior. However, defaulting on your EMI payments will negatively impact your score significantly.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Disclaimer: This calculator is for illustrative purposes only. Actual figures may vary based on your bank's policies. Please confirm all charges with your credit card provider.
                </p>
            </CardFooter>
           </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}
