
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pie, PieChart, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
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

interface MonthlyAmortizationData {
    month: number;
    interest: number;
    principal: number;
    balance: number;
}
interface AmortizationYear {
    year: number;
    interest: number;
    principal: number;
    balance: number;
    monthlyData: MonthlyAmortizationData[];
}

export default function FhaLoanCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;
  const [currency, setCurrency] = useState<Currency>(globalCurrency);

  const [homePrice, setHomePrice] = useState('500000');
  const [downPaymentPercent, setDownPaymentPercent] = useState('3.5');
  const [loanTerm, setLoanTerm] = useState('30');
  const [interestRate, setInterestRate] = useState('6.565');
  const [upfrontMip, setUpfrontMip] = useState('1.75');
  const [annualMip, setAnnualMip] = useState('0.55');
  const [annualMipDuration, setAnnualMipDuration] = useState('loanTerm');
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
  
  const calculateFhaLoan = () => {
    const p = parseFloat(homePrice);
    const dpPercent = parseFloat(downPaymentPercent) / 100;
    const termYears = parseInt(loanTerm);
    const rateMonthly = parseFloat(interestRate) / 12 / 100;
    const upfrontMipPercent = parseFloat(upfrontMip) / 100;
    const annualMipPercent = parseFloat(annualMip) / 100;
    const propTaxPercent = parseFloat(propertyTaxes) / 100;
    const insuranceAnnual = parseFloat(homeInsurance);
    const hoaAnnual = parseFloat(hoaFee);

    if (isNaN(p) || isNaN(dpPercent) || isNaN(termYears) || isNaN(rateMonthly)) {
        setResults(null);
        return;
    }

    const downPayment = p * dpPercent;
    const baseLoanAmount = p - downPayment;
    const upfrontMipAmount = baseLoanAmount * upfrontMipPercent;
    const totalLoanAmount = baseLoanAmount + upfrontMipAmount;
    
    const termMonths = termYears * 12;

    const emi = (totalLoanAmount * rateMonthly * Math.pow(1 + rateMonthly, termMonths)) / (Math.pow(1 + rateMonthly, termMonths) - 1);
    const totalMortgagePayment = emi * termMonths;
    const totalInterest = totalMortgagePayment - totalLoanAmount;

    const monthlyPropertyTax = (p * propTaxPercent) / 12;
    const monthlyInsurance = insuranceAnnual / 12;
    const monthlyHoa = hoaAnnual / 12;
    
    let balance = totalLoanAmount;
    let totalAnnualMipPaid = 0;
    
    const yearlyData: { [key: number]: Omit<AmortizationYear, 'year' | 'balance' | 'monthlyData'> & {monthlyData: MonthlyAmortizationData[]} } = {};

    for(let month = 1; month <= termMonths; month++) {
        const interestForMonth = balance * rateMonthly;
        const principalForMonth = emi - interestForMonth;
        balance -= principalForMonth;
        
        const year = Math.ceil(month/12);
        if(!yearlyData[year]){
            yearlyData[year] = { interest: 0, principal: 0, monthlyData: [] };
        }
        yearlyData[year].interest += interestForMonth;
        yearlyData[year].principal += principalForMonth;
        yearlyData[year].monthlyData.push({ month, interest: interestForMonth, principal: principalForMonth, balance });
    }
    
    const schedule: AmortizationYear[] = Object.keys(yearlyData).map((yearStr) => {
      const year = parseInt(yearStr);
      const data = yearlyData[year];
      return { year, ...data, balance: data.monthlyData[data.monthlyData.length - 1].balance };
    });
    setAmortizationSchedule(schedule);

    const mipDurationMonths = annualMipDuration === '11years' ? 11 * 12 : termMonths;
    const monthlyAnnualMip = (baseLoanAmount * annualMipPercent) / 12;
    totalAnnualMipPaid = monthlyAnnualMip * mipDurationMonths;
    
    const monthlyPayment = emi + monthlyPropertyTax + monthlyInsurance + monthlyHoa + monthlyAnnualMip;
    
    setResults({
        monthlyPayment: monthlyPayment,
        principalAndInterest: emi,
        monthlyPropertyTax: monthlyPropertyTax,
        monthlyInsurance: monthlyInsurance,
        monthlyAnnualMip: monthlyAnnualMip,
        monthlyHoa: monthlyHoa,
        totalInterest: totalInterest,
        totalTaxes: monthlyPropertyTax * termMonths,
        totalInsurance: monthlyInsurance * termMonths,
        totalAnnualMip: totalAnnualMipPaid,
        totalHoa: monthlyHoa * termMonths,
        totalPayment: totalMortgagePayment + (monthlyPropertyTax * termMonths) + (monthlyInsurance * termMonths) + (monthlyHoa * termMonths) + totalAnnualMipPaid,
        homePrice: p,
        downPayment: downPayment,
        upfrontMipAmount: upfrontMipAmount,
        totalLoanAmount: totalLoanAmount,
        payoffDate: new Date(new Date().setMonth(new Date().getMonth() + termMonths)).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    });
  };

  useEffect(() => {
    calculateFhaLoan();
  }, [homePrice, downPaymentPercent, loanTerm, interestRate, upfrontMip, annualMip, annualMipDuration, propertyTaxes, homeInsurance, hoaFee, currency]);
  
  const chartConfig = {
      p_i: { label: 'Principal & Interest', color: 'hsl(var(--chart-2))' },
      tax: { label: 'Property Taxes', color: 'hsl(var(--chart-3))' },
      insurance: { label: 'Home Insurance', color: 'hsl(var(--chart-5))' },
      mip: { label: 'Annual MIP', color: 'hsl(var(--chart-1))' },
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
          { name: 'mip', value: results.monthlyAnnualMip, fill: 'var(--color-mip)' },
          { name: 'hoa', value: results.monthlyHoa, fill: 'var(--color-hoa)' },
      ].filter(item => item.value > 0);
  }, [results]);

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">FHA Loan Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">FHA Loan Calculator</CardTitle>
              <CardDescription>
                Estimate your total monthly payment for an FHA-insured loan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                 <div className="space-y-4">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="home-price">Home Price</Label>
                           <Input id="home-price" value={homePrice} onChange={e => setHomePrice(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="down-payment">Down Payment (%)</Label>
                           <Input id="down-payment" value={downPaymentPercent} onChange={e => setDownPaymentPercent(e.target.value)} />
                        </div>
                      </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="loan-term">Loan Term (Years)</Label>
                           <Input id="loan-term" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                           <Input id="interest-rate" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                         </div>
                       </div>
                       <h4 className="font-semibold pt-2">FHA Mortgage Insurance Premium (MIP)</h4>
                        <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="upfront-mip">Upfront FHA MIP (%)</Label>
                           <Input id="upfront-mip" value={upfrontMip} onChange={e => setUpfrontMip(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="annual-mip">Annual FHA MIP (%)</Label>
                           <Input id="annual-mip" value={annualMip} onChange={e => setAnnualMip(e.target.value)} />
                         </div>
                         <div className="space-y-2 col-span-2">
                            <Label htmlFor="mip-duration">Annual FHA MIP Duration</Label>
                             <Select value={annualMipDuration} onValueChange={setAnnualMipDuration}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="loanTerm">Full Loan Term</SelectItem>
                                    <SelectItem value="11years">11 Years</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                       </div>
                       <h4 className="font-semibold pt-2">Other Costs</h4>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="prop-tax">Property Taxes (%/year)</Label>
                           <Input id="prop-tax" value={propertyTaxes} onChange={e => setPropertyTaxes(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="home-ins">Home Insurance ({currencySymbols[currency]}/year)</Label>
                           <Input id="home-ins" value={homeInsurance} onChange={e => setHomeInsurance(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="hoa">HOA Fee ({currencySymbols[currency]}/year)</Label>
                           <Input id="hoa" value={hoaFee} onChange={e => setHoaFee(e.target.value)} />
                         </div>
                       </div>
                 </div>
                 {results && (
                     <div className="space-y-4">
                         <div className="rounded-lg border p-4 text-center">
                            <p className="text-sm text-muted-foreground">Monthly Payment</p>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(results.monthlyPayment)}</p>
                         </div>
                         <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Monthly</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow><TableCell>Principal & Interest</TableCell><TableCell className="text-right">{formatCurrency(results.principalAndInterest)}</TableCell><TableCell className="text-right">{formatCurrency(results.totalLoanAmount + results.totalInterest)}</TableCell></TableRow>
                                        <TableRow><TableCell>Property Tax</TableCell><TableCell className="text-right">{formatCurrency(results.monthlyPropertyTax)}</TableCell><TableCell className="text-right">{formatCurrency(results.totalTaxes)}</TableCell></TableRow>
                                        <TableRow><TableCell>Home Insurance</TableCell><TableCell className="text-right">{formatCurrency(results.monthlyInsurance)}</TableCell><TableCell className="text-right">{formatCurrency(results.totalInsurance)}</TableCell></TableRow>
                                        <TableRow><TableCell>Annual MIP</TableCell><TableCell className="text-right">{formatCurrency(results.monthlyAnnualMip)}</TableCell><TableCell className="text-right">{formatCurrency(results.totalAnnualMip)}</TableCell></TableRow>
                                        <TableRow><TableCell>HOA Fee</TableCell><TableCell className="text-right">{formatCurrency(results.monthlyHoa)}</TableCell><TableCell className="text-right">{formatCurrency(results.totalHoa)}</TableCell></TableRow>
                                        <TableRow className="font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{formatCurrency(results.monthlyPayment)}</TableCell><TableCell className="text-right">{formatCurrency(results.totalPayment)}</TableCell></TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                         </Card>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Loan Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>House Price:</span> <span className="font-medium">{formatCurrency(results.homePrice)}</span></div>
                                <div className="flex justify-between"><span>Down Payment:</span> <span className="font-medium">{formatCurrency(results.downPayment)}</span></div>
                                <div className="flex justify-between"><span>Upfront MIP:</span> <span className="font-medium">{formatCurrency(results.upfrontMipAmount)}</span></div>
                                <div className="flex justify-between font-bold"><span>Total Loan Amount:</span> <span>{formatCurrency(results.totalLoanAmount)}</span></div>
                                <div className="flex justify-between"><span>Total Interest:</span> <span className="font-medium">{formatCurrency(results.totalInterest)}</span></div>
                                <div className="flex justify-between"><span>Payoff Date:</span> <span className="font-medium">{results.payoffDate}</span></div>
                            </CardContent>
                         </Card>
                     </div>
                 )}
              </div>
            </CardContent>
          </Card>
          {results && (
              <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Monthly Payment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-sm">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                    {pieChartData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                  </Card>
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
              </div>
          )}
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Understanding FHA Loans</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is an FHA Loan?</AccordionTrigger>
                        <AccordionContent>
                        FHA loans are mortgages insured by the Federal Housing Administration. They are popular with first-time homebuyers because they allow for low down payments (as low as 3.5%) and are available to individuals with less-than-perfect credit scores. The FHA doesn't lend money; it insures loans made by FHA-approved lenders.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>What is a Mortgage Insurance Premium (MIP)?</AccordionTrigger>
                        <AccordionContent>
                        MIP is a mandatory insurance policy for FHA loans. It protects the lender from losses if you default on your loan. It has two parts: an Upfront MIP (UFMIP), which is typically financed into the loan, and an Annual MIP, which is paid monthly as part of your mortgage payment.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>How long do I have to pay the Annual MIP?</AccordionTrigger>
                        <AccordionContent>
                        If your down payment is less than 10%, you will pay the Annual MIP for the entire life of the loan. If your down payment is 10% or more, you will pay the Annual MIP for the first 11 years of the loan.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What are the benefits of an FHA Loan?</AccordionTrigger>
                        <AccordionContent>
                        The main benefits are a low down payment requirement, more flexible credit score requirements compared to conventional loans, and competitive interest rates. This makes homeownership accessible to more people.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>Are there any downsides to an FHA Loan?</AccordionTrigger>
                        <AccordionContent>
                        The primary downside is the mandatory Mortgage Insurance Premium (MIP). Unlike Private Mortgage Insurance (PMI) on conventional loans, FHA MIP often cannot be canceled unless you refinance into a non-FHA loan, which adds to the overall cost of borrowing.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Disclaimer: This calculator is for illustrative purposes only. All calculations are based on the information you provide. For exact figures and financial advice, please consult with a qualified financial advisor and your lender.
                </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
