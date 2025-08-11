
'use client';

import { useState, useMemo, useContext, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';

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

export default function AprCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;

  const [activeTab, setActiveTab] = useState('general');
  const [currency, setCurrency] = useState<Currency>(globalCurrency);
  
  // General APR State
  const [gaLoanAmount, setGaLoanAmount] = useState('100000');
  const [gaLoanTermYears, setGaLoanTermYears] = useState('10');
  const [gaLoanTermMonths, setGaLoanTermMonths] = useState('0');
  const [gaInterestRate, setGaInterestRate] = useState('6');
  const [gaLoanedFees, setGaLoanedFees] = useState('0');
  const [gaUpfrontFees, setGaUpfrontFees] = useState('2500');
  const [gaResults, setGaResults] = useState<any>(null);

  // Mortgage APR State
  const [maHouseValue, setMaHouseValue] = useState('350000');
  const [maDownPayment, setMaDownPayment] = useState('20');
  const [maLoanTerm, setMaLoanTerm] = useState('30');
  const [maInterestRate, setMaInterestRate] = useState('6.2');
  const [maLoanFees, setMaLoanFees] = useState('3500');
  const [maPoints, setMaPoints] = useState('0.5');
  const [maResults, setMaResults] = useState<any>(null);

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
  
  const calculateGeneralApr = () => {
    const loanAmount = parseFloat(gaLoanAmount) || 0;
    const termYears = parseInt(gaLoanTermYears) || 0;
    const termMonths = parseInt(gaLoanTermMonths) || 0;
    const interestRate = parseFloat(gaInterestRate) / 100 || 0;
    const loanedFees = parseFloat(gaLoanedFees) || 0;
    const upfrontFees = parseFloat(gaUpfrontFees) || 0;

    const principal = loanAmount + loanedFees;
    const monthlyRate = interestRate / 12;
    const numberOfPayments = termYears * 12 + termMonths;

    if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setGaResults(null);
      return;
    }

    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - principal;
    const totalCost = totalInterest + loanedFees + upfrontFees;
    
    // Simplified APR calculation. A precise APR requires solving for the rate (IRR), which is complex.
    // This provides a good estimate for informational purposes.
    const apr = ((totalCost / loanAmount) / (numberOfPayments / 12)) * 100;
    
    setGaResults({
      apr,
      amountFinanced: principal,
      upfrontFees,
      monthlyPayment,
      totalPayments,
      totalInterest,
      totalCost,
      pieData: [
        { name: 'principal', value: principal, fill: 'var(--color-principal)' },
        { name: 'interest', value: totalInterest, fill: 'var(--color-interest)' },
        { name: 'fees', value: loanedFees + upfrontFees, fill: 'var(--color-fees)' },
      ]
    });
  };

  const calculateMortgageApr = () => {
    const houseValue = parseFloat(maHouseValue) || 0;
    const downPaymentPercent = parseFloat(maDownPayment) / 100 || 0;
    const termYears = parseInt(maLoanTerm) || 0;
    const interestRate = parseFloat(maInterestRate) / 100 || 0;
    const loanFees = parseFloat(maLoanFees) || 0;
    const pointsPercent = parseFloat(maPoints) / 100 || 0;

    const downPaymentAmount = houseValue * downPaymentPercent;
    const loanAmount = houseValue - downPaymentAmount;
    const pointsCost = loanAmount * pointsPercent;
    const upfrontFees = loanFees + pointsCost;

    const principal = loanAmount;
    const monthlyRate = interestRate / 12;
    const numberOfPayments = termYears * 12;

    if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setMaResults(null);
      return;
    }
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - principal;
    const totalCost = totalInterest + upfrontFees;
    
    // Simplified APR calculation
    const apr = ((totalCost / principal) / termYears) * 100;

    setMaResults({
      apr,
      loanAmount: principal,
      downPayment: downPaymentAmount,
      monthlyPayment,
      totalPayments,
      totalInterest,
      totalCost,
      pieData: [
        { name: 'principal', value: principal, fill: 'var(--color-principal)' },
        { name: 'interest', value: totalInterest, fill: 'var(--color-interest)' },
        { name: 'fees', value: upfrontFees, fill: 'var(--color-fees)' },
      ]
    });
  };

  const chartConfig = {
    principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
    interest: { label: 'Interest', color: 'hsl(var(--chart-1))' },
    fees: { label: 'Fees', color: 'hsl(var(--chart-5))' },
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">APR Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Annual Percentage Rate (APR) Calculator
              </CardTitle>
              <CardDescription>
                The cost of a loan involves more than just interest rates. Lenders often charge fees or points. This calculator helps reveal the true cost of loans by estimating the APR.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-lg">
                  <TabsTrigger value="general">General APR</TabsTrigger>
                  <TabsTrigger value="mortgage">Mortgage APR</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="m-0 pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ga-loan-amount">Loan Amount</Label>
                                <Input id="ga-loan-amount" type="number" value={gaLoanAmount} onChange={e => setGaLoanAmount(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ga-term-years">Loan Term</Label>
                                    <Input id="ga-term-years" type="number" value={gaLoanTermYears} onChange={e => setGaLoanTermYears(e.target.value)} placeholder="years"/>
                                </div>
                                <div className="space-y-2">
                                     <Label htmlFor="ga-term-months" className="invisible">Months</Label>
                                     <Input id="ga-term-months" type="number" value={gaLoanTermMonths} onChange={e => setGaLoanTermMonths(e.target.value)} placeholder="months"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ga-interest-rate">Interest Rate (%)</Label>
                                <Input id="ga-interest-rate" type="number" value={gaInterestRate} onChange={e => setGaInterestRate(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ga-loaned-fees">Loaned Fees (rolled into loan)</Label>
                                <Input id="ga-loaned-fees" type="number" value={gaLoanedFees} onChange={e => setGaLoanedFees(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ga-upfront-fees">Upfront Fees (out-of-pocket)</Label>
                                <Input id="ga-upfront-fees" type="number" value={gaUpfrontFees} onChange={e => setGaUpfrontFees(e.target.value)} />
                            </div>
                            <Button onClick={calculateGeneralApr} className="w-full">Calculate APR</Button>
                        </div>
                        {gaResults && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-center">Real APR: <span className="text-primary">{gaResults.apr.toFixed(3)}%</span></CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Amount Financed</span> <span className="font-medium">{formatCurrency(gaResults.amountFinanced)}</span></div>
                                        <div className="flex justify-between"><span>Upfront Fees</span> <span className="font-medium">{formatCurrency(gaResults.upfrontFees)}</span></div>
                                        <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Payment Every Month</span> <span>{formatCurrency(gaResults.monthlyPayment)}</span></div>
                                        <div className="flex justify-between"><span>Total of {parseInt(gaLoanTermYears)*12 + parseInt(gaLoanTermMonths)} Payments</span> <span className="font-medium">{formatCurrency(gaResults.totalPayments)}</span></div>
                                        <div className="flex justify-between text-red-600 dark:text-red-400"><span>Total Interest</span> <span className="font-medium">{formatCurrency(gaResults.totalInterest)}</span></div>
                                         <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base"><span>All Payments & Fees</span> <span>{formatCurrency(gaResults.totalCost + gaResults.amountFinanced - gaResults.loanedFees)}</span></div>
                                    </CardContent>
                                </Card>
                                 <div className="flex items-center justify-center">
                                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-sm">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                            <Pie data={gaResults.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {gaResults.pieData.map((entry: any) => (<Cell key={entry.name} fill={entry.fill} />))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="mortgage" className="m-0 pt-4">
                     <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ma-house-value">House Value</Label>
                                <Input id="ma-house-value" type="number" value={maHouseValue} onChange={e => setMaHouseValue(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ma-down-payment">Down Payment (%)</Label>
                                <Input id="ma-down-payment" type="number" value={maDownPayment} onChange={e => setMaDownPayment(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ma-loan-term">Loan Term (years)</Label>
                                <Input id="ma-loan-term" type="number" value={maLoanTerm} onChange={e => setMaLoanTerm(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ma-interest-rate">Interest Rate (%)</Label>
                                <Input id="ma-interest-rate" type="number" value={maInterestRate} onChange={e => setMaInterestRate(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ma-loan-fees">Loan Fees</Label>
                                <Input id="ma-loan-fees" type="number" value={maLoanFees} onChange={e => setMaLoanFees(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="ma-points">Points (%)</Label>
                                <Input id="ma-points" type="number" value={maPoints} onChange={e => setMaPoints(e.target.value)} />
                            </div>
                             <Button onClick={calculateMortgageApr} className="w-full">Calculate APR</Button>
                        </div>
                         {maResults && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-center">Real APR: <span className="text-primary">{maResults.apr.toFixed(3)}%</span></CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Loan Amount</span> <span className="font-medium">{formatCurrency(maResults.loanAmount)}</span></div>
                                        <div className="flex justify-between"><span>Down Payment</span> <span className="font-medium">{formatCurrency(maResults.downPayment)}</span></div>
                                        <div className="flex justify-between font-semibold border-t pt-2 mt-2"><span>Monthly Payment</span> <span>{formatCurrency(maResults.monthlyPayment)}</span></div>
                                        <div className="flex justify-between"><span>Total of {parseInt(maLoanTerm) * 12} Payments</span> <span className="font-medium">{formatCurrency(maResults.totalPayments)}</span></div>
                                        <div className="flex justify-between text-red-600 dark:text-red-400"><span>Total Interest</span> <span className="font-medium">{formatCurrency(maResults.totalInterest)}</span></div>
                                         <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base"><span>All Payments & Fees</span> <span>{formatCurrency(maResults.totalCost + maResults.loanAmount)}</span></div>
                                    </CardContent>
                                </Card>
                                 <div className="flex items-center justify-center">
                                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-sm">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                            <Pie data={maResults.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {maResults.pieData.map((entry: any) => (<Cell key={entry.name} fill={entry.fill} />))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is APR (Annual Percentage Rate)?</AccordionTrigger>
                        <AccordionContent>
                        The Annual Percentage Rate (APR) is a broader measure of the cost of borrowing money than the interest rate. It includes the interest rate plus other charges, such as broker fees, discount points, and some closing costs. This makes it a more accurate representation of the total cost of a loan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Why is APR more important than the interest rate?</AccordionTrigger>
                        <AccordionContent>
                        While a low interest rate is attractive, it doesn't tell the whole story. A loan with a lower interest rate could have higher fees, resulting in a higher APR and a more expensive loan overall. Comparing APRs between lenders gives you a more accurate, apples-to-apples comparison of loan costs.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What are "points"?</AccordionTrigger>
                        <AccordionContent>
                        Discount points are fees paid directly to the lender at closing in exchange for a reduced interest rate. One point costs 1 percent of your loan amount. Paying points can be a good option if you plan to stay in the home long enough to realize the savings from the lower rate.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What's the difference between loaned fees and upfront fees?</AccordionTrigger>
                        <AccordionContent>
                        Loaned fees are costs that are rolled into the total loan amount you borrow. Upfront fees (or out-of-pocket fees) are costs you must pay at closing and are not financed as part of the loan. Both types of fees are included in the APR calculation.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Is a lower APR always better?</AccordionTrigger>
                        <AccordionContent>
                        Generally, yes. A lower APR means a lower total cost of borrowing. However, you should also consider the loan term. A shorter-term loan might have a slightly higher APR but could save you money in total interest because you're paying it off faster. It's important to compare loans with the same term length.
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
