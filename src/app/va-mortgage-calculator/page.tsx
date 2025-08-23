
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pie, PieChart, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface AmortizationYear {
    year: number;
    interest: number;
    principal: number;
    balance: number;
}

export default function VaMortgageCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;
  const [currency, setCurrency] = useState<Currency>(globalCurrency);

  const [homePrice, setHomePrice] = useState('500000');
  const [downPaymentPercent, setDownPaymentPercent] = useState('0');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('6.565');
  
  // VA Eligibility
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  
  // Other costs
  const [propertyTaxes, setPropertyTaxes] = useState('1.2');
  const [homeInsurance, setHomeInsurance] = useState('2500');
  const [hoaFee, setHoaFee] = useState('0');


  const [results, setResults] = useState<any>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationYear[]>([]);

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
  
  const getVaFundingFeeRate = useMemo(() => {
      if (hasDisability) return 0;
      const dp = parseFloat(downPaymentPercent);

      if (isFirstTimeUser) {
          if (dp < 5) return 2.15;
          if (dp < 10) return 1.5;
          return 1.25;
      } else { // Subsequent use
          if (dp < 5) return 3.3;
          if (dp < 10) return 1.5;
          return 1.25;
      }
  }, [downPaymentPercent, isFirstTimeUser, hasDisability]);

  const calculateVaLoan = () => {
    const p = parseFloat(homePrice);
    const dpPercent = parseFloat(downPaymentPercent) / 100;
    const termYears = parseInt(loanTerm);
    const rateMonthly = parseFloat(interestRate) / 12 / 100;
    const propTaxPercent = parseFloat(propertyTaxes) / 100;
    const insuranceAnnual = parseFloat(homeInsurance);
    const hoaAnnual = parseFloat(hoaFee);

    if (isNaN(p) || isNaN(dpPercent) || isNaN(termYears) || isNaN(rateMonthly)) {
        setResults(null);
        return;
    }

    const downPayment = p * dpPercent;
    const baseLoanAmount = p - downPayment;
    const vaFundingFee = baseLoanAmount * (getVaFundingFeeRate / 100);
    const totalLoanAmount = baseLoanAmount + vaFundingFee;
    
    const termMonths = termYears * 12;

    const emi = (totalLoanAmount * rateMonthly * Math.pow(1 + rateMonthly, termMonths)) / (Math.pow(1 + rateMonthly, termMonths) - 1);
    const totalMortgagePayment = emi * termMonths;
    const totalInterest = totalMortgagePayment - totalLoanAmount;

    const monthlyPropertyTax = (p * propTaxPercent) / 12;
    const monthlyInsurance = insuranceAnnual / 12;
    const monthlyHoa = hoaAnnual / 12;

    let balance = totalLoanAmount;
    const yearlyData: { [key: number]: Omit<AmortizationYear, 'year' | 'balance'> } = {};

    for(let month = 1; month <= termMonths; month++) {
        const interestForMonth = balance * rateMonthly;
        const principalForMonth = emi - interestForMonth;
        balance -= principalForMonth;
        
        const year = Math.ceil(month/12);
        if(!yearlyData[year]){
            yearlyData[year] = { interest: 0, principal: 0 };
        }
        yearlyData[year].interest += interestForMonth;
        yearlyData[year].principal += principalForMonth;
    }
    
    balance = totalLoanAmount;
    const schedule: AmortizationYear[] = Object.keys(yearlyData).map((yearStr) => {
        const year = parseInt(yearStr);
        const data = yearlyData[year];
        const yearPrincipal = data.principal;
        balance -= yearPrincipal;
        return { year, ...data, balance };
    });

    setAmortizationSchedule(schedule);
    
    const monthlyPayment = emi + monthlyPropertyTax + monthlyInsurance + monthlyHoa;
    
    setResults({
        monthlyPayment,
        principalAndInterest: emi,
        monthlyPropertyTax,
        monthlyInsurance,
        monthlyHoa,
        totalInterest,
        totalTaxes: monthlyPropertyTax * termMonths,
        totalInsurance: monthlyInsurance * termMonths,
        totalHoa: monthlyHoa * termMonths,
        totalPayment: totalMortgagePayment + (monthlyPropertyTax * termMonths) + (monthlyInsurance * termMonths) + (monthlyHoa * termMonths),
        homePrice: p,
        downPayment,
        vaFundingFee,
        fundingFeeRate: getVaFundingFeeRate,
        totalLoanAmount,
        payoffDate: new Date(new Date().setMonth(new Date().getMonth() + termMonths)).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    });
  };
  
  const chartConfig = {
      p_i: { label: 'P&I', color: 'hsl(var(--chart-2))' },
      tax: { label: 'Taxes', color: 'hsl(var(--chart-3))' },
      insurance: { label: 'Insurance', color: 'hsl(var(--chart-5))' },
      hoa: { label: 'HOA', color: 'hsl(var(--chart-4))' },
      balance: { label: 'Balance', color: 'hsl(var(--chart-4))' },
      principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
      interest: { label: 'Interest', color: 'hsl(var(--chart-1))' },
  };

  const pieChartData = useMemo(() => {
      if (!results) return [];
      return [
          { name: 'p_i', value: results.principalAndInterest, fill: 'var(--color-p_i)' },
          { name: 'tax', value: results.monthlyPropertyTax, fill: 'var(--color-tax)' },
          { name: 'insurance', value: results.monthlyInsurance, fill: 'var(--color-insurance)' },
          { name: 'hoa', value: results.monthlyHoa, fill: 'var(--color-hoa)' },
      ].filter(item => item.value > 0);
  }, [results]);

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">VA Mortgage Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">VA Loan Calculator</CardTitle>
              <CardDescription>
                Estimate your total monthly payment for a VA-backed loan. Click the button to calculate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                 <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                                <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="home-price">Home Price</Label>
                           <Input id="home-price" value={homePrice} onChange={e => setHomePrice(e.target.value)} />
                        </div>
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="down-payment">Down Payment (%)</Label>
                           <Input id="down-payment" value={downPaymentPercent} onChange={e => setDownPaymentPercent(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="loan-term">Loan Term (Years)</Label>
                           <Input id="loan-term" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} />
                         </div>
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                           <Input id="interest-rate" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                       </div>
                       
                       <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">VA Eligibility</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="first-time-user">Used VA Loan Before?</Label>
                                    <Switch id="first-time-user" checked={!isFirstTimeUser} onCheckedChange={(checked) => setIsFirstTimeUser(!checked)} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="has-disability">Service-Related Disability (10%+)?</Label>
                                    <Switch id="has-disability" checked={hasDisability} onCheckedChange={setHasDisability} />
                                </div>
                            </CardContent>
                       </Card>

                       <h4 className="font-semibold pt-2">Other Costs (Annual)</h4>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="prop-tax">Property Taxes (%)</Label>
                           <Input id="prop-tax" value={propertyTaxes} onChange={e => setPropertyTaxes(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="home-ins">Home Insurance</Label>
                           <Input id="home-ins" value={homeInsurance} onChange={e => setHomeInsurance(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="hoa">HOA Fee</Label>
                           <Input id="hoa" value={hoaFee} onChange={e => setHoaFee(e.target.value)} />
                         </div>
                       </div>
                       <Button onClick={calculateVaLoan} className="w-full">Calculate</Button>
                 </div>
                 {results && (
                     <div className="space-y-4">
                         <div className="rounded-lg border p-4 text-center">
                            <p className="text-sm text-muted-foreground">Monthly Payment</p>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(results.monthlyPayment)}</p>
                         </div>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Loan Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>House Price:</span> <span className="font-medium">{formatCurrency(results.homePrice)}</span></div>
                                <div className="flex justify-between"><span>Down Payment:</span> <span className="font-medium">{formatCurrency(results.downPayment)}</span></div>
                                <div className="flex justify-between"><span>VA Funding Fee ({results.fundingFeeRate}%):</span> <span className="font-medium">{formatCurrency(results.vaFundingFee)}</span></div>
                                <div className="flex justify-between font-bold"><span>Total Loan Amount:</span> <span>{formatCurrency(results.totalLoanAmount)}</span></div>
                                <div className="flex justify-between text-red-600 dark:text-red-400"><span>Total Interest:</span> <span className="font-medium">{formatCurrency(results.totalInterest)}</span></div>
                                <div className="flex justify-between"><span>Payoff Date:</span> <span className="font-medium">{results.payoffDate}</span></div>
                            </CardContent>
                         </Card>
                          <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Monthly Payment Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-sm">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                        <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                            {pieChartData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                                        </Pie>
                                        <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                                    </PieChart>
                                </ChartContainer>
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
                    <CardTitle className="font-headline">Amortization Schedule</CardTitle>
                    <CardDescription>Yearly breakdown of loan balance vs. interest paid.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={amortizationSchedule}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Yr ${v}`} />
                            <YAxis yAxisId="left" orientation="left" tickFormatter={(v) => formatCurrency(v)} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value, name) => <span>{formatCurrency(value as number)}</span>} />} />
                            <Legend />
                            <Bar dataKey="principal" fill="var(--color-principal)" yAxisId="left" name={chartConfig.principal.label} radius={4} />
                            <Line type="monotone" dataKey="balance" stroke="var(--color-balance)" yAxisId="right" name={chartConfig.balance.label} strokeWidth={2} dot={false} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Understanding VA Loans</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is a VA Loan?</AccordionTrigger>
                        <AccordionContent>
                        A VA loan is a mortgage guaranteed by the U.S. Department of Veterans Affairs (VA). It's a benefit for qualified veterans, active-duty service members, and eligible surviving spouses. The main advantages are no down payment requirement and no private mortgage insurance (PMI).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What is the VA Funding Fee?</AccordionTrigger>
                        <AccordionContent>
                        The VA funding fee is a one-time payment that the veteran, service member, or survivor pays on a VA-backed loan. This fee helps to lower the cost of the loan for U.S. taxpayers since the VA loan program doesn't require down payments or monthly mortgage insurance. The fee amount is a percentage of the loan amount and varies based on the down payment and whether it's a first-time or subsequent use.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Who is exempt from the VA Funding Fee?</AccordionTrigger>
                        <AccordionContent>
                        You may be exempt from paying the VA funding fee if you are a veteran receiving VA compensation for a service-connected disability, a veteran who would be entitled to receive compensation for a service-connected disability if you did not receive retirement or active duty pay, or a surviving spouse of a veteran who died in service or from a service-connected disability.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Can the VA Funding Fee be financed?</AccordionTrigger>
                        <AccordionContent>
                        Yes, the VA funding fee can be financed into the total loan amount. This calculator automatically includes the financed fee in its calculations for the total loan and monthly payment.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>Do I still have to pay property taxes and home insurance?</AccordionTrigger>
                        <AccordionContent>
                        Yes. Even with a VA loan, you are responsible for paying property taxes and homeowners insurance. These costs are typically collected as part of your total monthly mortgage payment and held in an escrow account by your lender, who then pays them on your behalf.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Disclaimer: This calculator provides an estimate for informational purposes only. For exact figures, financial advice, and to confirm your eligibility, please consult with a qualified financial advisor and a VA-approved lender.
                </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
