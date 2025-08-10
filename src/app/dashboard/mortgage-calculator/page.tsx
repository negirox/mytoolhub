
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Pie,
  PieChart,
  Cell,
} from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState('300000');
  const [downPayment, setDownPayment] = useState('60000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTerm, setLoanTerm] = useState('30');

  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  
  const loanAmount = useMemo(() => {
    return (parseFloat(homePrice) || 0) - (parseFloat(downPayment) || 0);
  }, [homePrice, downPayment]);


  const calculateMortgage = () => {
    const p = loanAmount;
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(loanTerm) * 12;

    if (p <= 0 || r <= 0 || n <= 0) {
      setMonthlyPayment(null);
      setTotalInterest(null);
      setTotalPayment(null);
      return;
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaymentValue = emi * n;
    const totalInterestValue = totalPaymentValue - p;

    setMonthlyPayment(emi);
    setTotalInterest(totalInterestValue);
    setTotalPayment(totalPaymentValue);
  };

  useEffect(() => {
    calculateMortgage();
  }, [loanAmount, interestRate, loanTerm]);

  const downPaymentPercentage = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    if (price === 0) return 0;
    return (dp / price) * 100;
  }, [homePrice, downPayment]);

  const handleDownPaymentPercentageChange = (value: number) => {
    const price = parseFloat(homePrice) || 0;
    setDownPayment(String(Math.round((price * value) / 100)));
  };

  const chartConfig = {
    principal: { label: 'Principal Loan', color: 'hsl(var(--chart-2))' },
    interest: { label: 'Total Interest', color: 'hsl(var(--chart-1))' },
  };
  
  const pieChartData = useMemo(() => ([
    { name: 'principal', value: loanAmount, fill: 'var(--color-principal)' },
    { name: 'interest', value: totalInterest || 0, fill: 'var(--color-interest)' }
  ]), [loanAmount, totalInterest]);


  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Mortgage Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Mortgage Payment Calculator
              </CardTitle>
              <CardDescription>
                Estimate your monthly mortgage payment and see how much you'll pay in interest over the life of the loan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="home-price">Home Price ($)</Label>
                    <Input
                      id="home-price"
                      type="number"
                      value={homePrice}
                      onChange={(e) => setHomePrice(e.target.value)}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="down-payment">Down Payment ($)</Label>
                    <Input
                      id="down-payment"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                    />
                     <Slider
                      value={[downPaymentPercentage]}
                      onValueChange={(value) => handleDownPaymentPercentageChange(value[0])}
                      max={100}
                      step={1}
                    />
                    <p className="text-sm text-muted-foreground">Down Payment: {downPaymentPercentage.toFixed(1)}%</p>
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
                    <Slider
                      value={[parseFloat(interestRate)]}
                      onValueChange={(value) => setInterestRate(String(value[0]))}
                      min={1}
                      max={15}
                      step={0.1}
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
                     <Slider
                      value={[parseFloat(loanTerm)]}
                      onValueChange={(value) => setLoanTerm(String(value[0]))}
                      min={5}
                      max={40}
                      step={1}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                    {monthlyPayment !== null && (
                        <div className="grid grid-cols-1 gap-4 text-center w-full">
                           <div className="space-y-1 rounded-lg border p-4">
                              <p className="text-sm font-medium text-muted-foreground">Monthly Payment (Principal & Interest)</p>
                              <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                            </div>
                            <div className="space-y-1 rounded-lg border p-4">
                              <p className="text-sm font-medium text-muted-foreground">Total Interest Paid</p>
                              <p className="text-2xl font-bold">{formatCurrency(totalInterest || 0)}</p>
                            </div>
                            <div className="space-y-1 rounded-lg border p-4">
                              <p className="text-sm font-medium text-muted-foreground">Total of all Payments</p>
                              <p className="text-2xl font-bold">{formatCurrency(totalPayment || 0)}</p>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
          
           {loanAmount > 0 && totalInterest !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Loan Breakdown</CardTitle>
                <CardDescription>A visual comparison of the total principal versus the total interest paid over the life of the loan.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                  <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-sm">
                     <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                        <Pie
                          data={pieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);
                              return (
                              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                  {`${(percent * 100).toFixed(0)}%`}
                              </text>
                              );
                          }}
                        >
                          {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                     </PieChart>
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
                        <AccordionTrigger>What is a mortgage?</AccordionTrigger>
                        <AccordionContent>
                        A mortgage is a loan used to purchase or maintain a home, land, or other types of real estate. The borrower agrees to pay the lender over time, typically in a series of regular payments that are divided into principal and interest. The property itself serves as collateral to secure the loan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What does P&I stand for?</AccordionTrigger>
                        <AccordionContent>
                        P&I stands for Principal and Interest, which are the two components of a mortgage payment. The principal is the amount you borrowed, and the interest is the charge you pay to the lender for borrowing the money. This calculator estimates the P&I portion of your monthly payment.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>How does the loan term affect my payment?</AccordionTrigger>
                        <AccordionContent>
                        The loan term is the length of time you have to repay the loan. A shorter term (like 15 years) will have higher monthly payments but lower total interest costs. A longer term (like 30 years) will have lower monthly payments but you'll pay significantly more in interest over the life of the loan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What is the impact of a larger down payment?</AccordionTrigger>
                        <AccordionContent>
                        A larger down payment reduces the total amount you need to borrow. This results in a smaller monthly mortgage payment and less total interest paid over the loan's term. It can also help you avoid paying for Private Mortgage Insurance (PMI).
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>What other costs are associated with a mortgage?</AccordionTrigger>
                        <AccordionContent>
                        Besides principal and interest, your total monthly housing payment often includes property taxes, homeowners insurance, and sometimes Private Mortgage Insurance (PMI) or homeowners association (HOA) fees. This calculator focuses only on the principal and interest.
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
