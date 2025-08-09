
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';


const GST_RATE = 0.18; // 18% GST

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CreditCardEmiCalculatorPage() {
  const [amount, setAmount] = useState('15000');
  const [rate, setRate] = useState('18');
  const [tenure, setTenure] = useState('6');
  const [fees, setFees] = useState('300');

  const [results, setResults] = useState({
    monthlyEmi: 0,
    apr: 0,
    processingFeeGst: 0,
    totalInterest: 0,
    gstOnInterest: 0,
    totalPayments: 0,
  });

  const calculateEmi = () => {
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 12 / 100; // Monthly interest rate
    const n = parseInt(tenure);
    const procFees = parseFloat(fees) || 0;

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r < 0 || n <= 0) {
      return;
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaymentWithoutFees = emi * n;
    const totalInterest = totalPaymentWithoutFees - p;
    
    const processingFeeWithGst = procFees * (1 + GST_RATE);
    const gstOnInterestComponent = totalInterest * GST_RATE;

    const totalCost = p + totalInterest + processingFeeWithGst + gstOnInterestComponent;

    // APR Calculation (approximate)
    // Formula: ( (Total Interest + Fees) / Principal ) * ( 1 / Tenure in Years ) * 100
    const totalFeesAndInterest = totalInterest + procFees; // Using pre-GST fees for standard APR
    const tenureInYears = n / 12;
    const apr = (totalFeesAndInterest / p) * (1 / tenureInYears) * 100;


    setResults({
      monthlyEmi: emi,
      apr: apr,
      processingFeeGst: processingFeeWithGst,
      totalInterest: totalInterest,
      gstOnInterest: gstOnInterestComponent,
      totalPayments: totalCost,
    });
  };
  
  useEffect(() => {
    calculateEmi();
  }, [amount, rate, tenure, fees]);
  
  const chartConfig = {
      principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
      interest: { label: 'Total Interest', color: 'hsl(var(--chart-1))' },
      fees: { label: 'Total Fees & GST', color: 'hsl(var(--chart-5))' },
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


  return (
    <>
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
                    <Label htmlFor="amount">Transaction Amount (₹)</Label>
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
                    <Label htmlFor="fees">Processing Fees (pre-GST) (₹)</Label>
                    <Input id="fees" type="number" value={fees} onChange={(e) => setFees(e.target.value)} />
                  </div>
                  <Button onClick={calculateEmi} className="w-full md:w-auto">Recalculate</Button>
                </div>
                 <div className="flex flex-col gap-4">
                    <Card className="bg-muted/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">Monthly EMI</span>
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
          
          <Card>
              <CardHeader>
                <CardTitle className="font-headline">Cost Breakdown</CardTitle>
                <CardDescription>A visual breakdown of your total payment.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-sm">
                      <PieChart>
                          <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                          <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                            {pieChartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartLegend content={<ChartLegendContent nameKey="name" formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                      </PieChart>
                  </ChartContainer>
              </CardContent>
            </Card>

           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>How is Credit Card EMI different from a regular loan EMI?</AccordionTrigger>
                        <AccordionContent>
                        Credit Card EMIs often come with higher interest rates than traditional personal loans. They also involve processing fees and GST on those fees, as well as GST on the interest component of each EMI, which this calculator accounts for.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What is APR (Annual Percentage Rate)?</AccordionTrigger>
                        <AccordionContent>
                        APR represents the true annual cost of your loan, including the interest rate and any pre-GST processing fees. It gives you a more complete picture of the loan's cost than the interest rate alone.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Why is GST charged on Credit Card EMIs?</AccordionTrigger>
                        <AccordionContent>
                        The Indian government classifies credit card services as a financial service, which is subject to GST. This tax is applied to the processing fee at the time of conversion and to the interest portion of every monthly installment you pay.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Can I foreclose my Credit Card EMI?</AccordionTrigger>
                        <AccordionContent>
                        Yes, most banks allow you to foreclose (pay off early) your Credit Card EMI. However, they usually charge a foreclosure fee and require you to pay the outstanding principal along with any accrued interest and applicable GST.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
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
    </>
  );
}
