'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Slider } from '@/components/ui/slider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type PrepaymentFrequency = 'none' | 'monthly' | 'yearly' | 'quarterly';
interface AmortizationData {
  year: number;
  principal: number;
  interest: number;
  extraPayment: number;
  remainingBalance: number;
  totalInterest: number;
  totalPayment: number;
}

export default function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState('1000000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  // Advanced Options State
  const [prepaymentFrequency, setPrepaymentFrequency] =
    useState<PrepaymentFrequency>('none');
  const [prepaymentAmount, setPrepaymentAmount] = useState('0');

  // Results State
  const [emi, setEmi] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [amortizationData, setAmortizationData] = useState<AmortizationData[]>(
    []
  );

  const calculateEmi = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(tenure) * 12;
    const extra = parseFloat(prepaymentAmount) || 0;

    if (p <= 0 || r <= 0 || n <= 0) {
      setEmi(null);
      setTotalInterest(null);
      setTotalPayment(null);
      setAmortizationData([]);
      return;
    }

    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(emiValue);

    let balance = p;
    let totalInterestPaid = 0;
    let totalExtraPayments = 0;
    const schedule: AmortizationData[] = [];
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;
    let cumulativeExtraPayment = 0;

    const yearlyData: { [key: number]: Omit<AmortizationData, 'year' | 'remainingBalance'> } = {};

    for (let month = 1; month <= n && balance > 0; month++) {
      const interestForMonth = balance * r;
      const principalForMonth = emiValue - interestForMonth;

      let actualPrincipalPaid = principalForMonth;
      let extraPaymentForMonth = 0;

      if (prepaymentFrequency !== 'none') {
        if (prepaymentFrequency === 'monthly') {
          extraPaymentForMonth = extra;
        } else if (
          prepaymentFrequency === 'yearly' &&
          month % 12 === 0
        ) {
          extraPaymentForMonth = extra;
        } else if (
          prepaymentFrequency === 'quarterly' &&
          month % 3 === 0
        ) {
          extraPaymentForMonth = extra;
        }
      }
      
      const totalPaymentForMonth = principalForMonth + interestForMonth + extraPaymentForMonth;
      if(balance < totalPaymentForMonth) {
        actualPrincipalPaid = balance;
        balance = 0;
      } else {
        balance -= (principalForMonth + extraPaymentForMonth);
      }

      totalInterestPaid += interestForMonth;
      totalExtraPayments += extraPaymentForMonth;

      const year = Math.ceil(month / 12);
      if (!yearlyData[year]) {
        yearlyData[year] = { principal: 0, interest: 0, extraPayment: 0, totalInterest: 0, totalPayment: 0 };
      }
      yearlyData[year].principal += actualPrincipalPaid;
      yearlyData[year].interest += interestForMonth;
      yearlyData[year].extraPayment += extraPaymentForMonth;
    }

     Object.keys(yearlyData).forEach(yearStr => {
        const year = parseInt(yearStr);
        const data = yearlyData[year];
        cumulativePrincipal += data.principal + data.extraPayment;
        cumulativeInterest += data.interest;
        schedule.push({
            year: year,
            principal: cumulativePrincipal,
            interest: cumulativeInterest,
            extraPayment: data.extraPayment,
            remainingBalance: p - cumulativePrincipal,
            totalInterest: cumulativeInterest,
            totalPayment: cumulativePrincipal + cumulativeInterest
        });
    });


    setTotalInterest(totalInterestPaid);
    setTotalPayment(p + totalInterestPaid);
    setAmortizationData(schedule);
  };
  
  useEffect(() => {
    calculateEmi();
  }, [principal, interestRate, tenure, prepaymentAmount, prepaymentFrequency])


  const chartConfig = {
    principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
    interest: { label: 'Interest', color: 'hsl(var(--chart-1))' },
  };

  const totalInterestFormatted = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalInterest || 0);
  }, [totalInterest]);

  const totalPaymentFormatted = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalPayment || 0);
  }, [totalPayment]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
        <h1 className="font-headline text-xl font-semibold">EMI Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Equated Monthly Installment (EMI) Calculator
              </CardTitle>
              <CardDescription>
                Calculate your monthly loan installments and see a detailed
                amortization schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="principal">Loan Amount (₹)</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder="e.g., 10,00,000"
                  />
                  <Slider
                    value={[parseFloat(principal)]}
                    onValueChange={(value) => setPrincipal(String(value[0]))}
                    min={100000}
                    max={20000000}
                    step={100000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest">Interest Rate (% p.a.)</Label>
                  <Input
                    id="interest"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="e.g., 8.5"
                    step="0.1"
                  />
                  <Slider
                    value={[parseFloat(interestRate)]}
                    onValueChange={(value) => setInterestRate(String(value[0]))}
                    max={20}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenure">Loan Tenure (Years)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="e.g., 20"
                  />
                  <Slider
                    value={[parseFloat(tenure)]}
                    onValueChange={(value) => setTenure(String(value[0]))}
                    max={30}
                    step={1}
                  />
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Advanced Options (Prepayment)</AccordionTrigger>
                  <AccordionContent>
                     <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                           <Label htmlFor="prepayment-freq">Prepayment Frequency</Label>
                           <Select value={prepaymentFrequency} onValueChange={(val) => setPrepaymentFrequency(val as PrepaymentFrequency)}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="none">None</SelectItem>
                                 <SelectItem value="monthly">Monthly</SelectItem>
                                 <SelectItem value="quarterly">Quarterly</SelectItem>
                                 <SelectItem value="yearly">Yearly</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="prepayment-amount">Prepayment Amount (₹)</Label>
                           <Input id="prepayment-amount" type="number" value={prepaymentAmount} onChange={(e) => setPrepaymentAmount(e.target.value)} placeholder="e.g. 10000" disabled={prepaymentFrequency === 'none'}/>
                        </div>
                     </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {emi !== null && (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="p-4">
                        <CardHeader className="p-2 pt-0">
                            <CardTitle className="text-sm font-medium">Monthly EMI</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                             <p className="text-2xl font-bold text-primary">
                                {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0,
                                }).format(emi)}
                             </p>
                        </CardContent>
                    </Card>
                    <Card className="p-4">
                        <CardHeader className="p-2 pt-0">
                            <CardTitle className="text-sm font-medium">Total Interest</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                             <p className="text-2xl font-bold">{totalInterestFormatted}</p>
                        </CardContent>
                    </Card>
                    <Card className="p-4">
                        <CardHeader className="p-2 pt-0">
                            <CardTitle className="text-sm font-medium">Total Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                             <p className="text-2xl font-bold">{totalPaymentFormatted}</p>
                        </CardContent>
                    </Card>
                </div>
              )}
            </CardContent>
          </Card>
          
          {amortizationData.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Loan Amortization</CardTitle>
                    <CardDescription>Breakdown of your payments over the loan tenure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                         <AreaChart accessibilityLayer data={amortizationData} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `Year ${value}`} />
                             <YAxis tickFormatter={(value) => `₹${value / 100000}L`} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value, name) => (
                                <div className="flex flex-col">
                                    <span className="capitalize">{name}</span>
                                    <span className="font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value as number)}</span>
                                </div>
                            )}/>} />
                             <ChartLegend content={<ChartLegendContent />} />
                            <Area dataKey="principal" type="natural" fill="var(--color-principal)" fillOpacity={0.4} stroke="var(--color-principal)" stackId="a" />
                            <Area dataKey="interest" type="natural" fill="var(--color-interest)" fillOpacity={0.4} stroke="var(--color-interest)" stackId="a" />
                         </AreaChart>
                    </ChartContainer>
                </CardContent>
             </Card>
          )}

        </div>
      </main>
    </>
  );
}
