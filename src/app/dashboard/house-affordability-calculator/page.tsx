
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, AlertCircle } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function HouseAffordabilityCalculatorPage() {
  const [activeTab, setActiveTab] = useState('income');
  
  // Income-based state
  const [annualIncome, setAnnualIncome] = useState('120000');
  const [monthlyDebt, setMonthlyDebt] = useState('0');
  const [interestRate, setInterestRate] = useState('6.565');
  const [loanTerm, setLoanTerm] = useState('30');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [propertyTaxPercent, setPropertyTaxPercent] = useState('1.5');
  const [homeInsurancePercent, setHomeInsurancePercent] = useState('0.5');
  const [hoaFees, setHoaFees] = useState('0'); // This will be monthly fee
  const [dtiRatio, setDtiRatio] = useState('28/36');

  // Budget-based state
  const [monthlyBudget, setMonthlyBudget] = useState('3500');
  const [bbInterestRate, setBbInterestRate] = useState('6.565');
  const [bbLoanTerm, setBbLoanTerm] = useState('30');
  const [bbDownPaymentPercent, setBbDownPaymentPercent] = useState('20');
  const [bbPropertyTaxPercent, setBbPropertyTaxPercent] = useState('1.5');
  const [bbHomeInsurancePercent, setBbHomeInsurancePercent] = useState('0.5');
  const [bbHoaFees, setBbHoaFees] = useState('0');

  const [results, setResults] = useState<{
    affordableHomePrice: number;
    loanAmount: number;
    monthlyPayment: number;
    principalAndInterest: number;
    propertyTaxes: number;
    homeInsurance: number;
    hoa: number;
  } | null>(null);

  const calculateAffordability = () => {
    let affordableHomePrice = 0;
    
    if (activeTab === 'income') {
      const income = parseFloat(annualIncome) || 0;
      const debt = parseFloat(monthlyDebt) || 0;
      const rate = parseFloat(interestRate) || 0;
      const term = parseInt(loanTerm) || 0;
      const downPayment = parseFloat(downPaymentPercent) / 100 || 0;
      const taxRate = parseFloat(propertyTaxPercent) / 100 || 0;
      const insuranceRate = parseFloat(homeInsurancePercent) / 100 || 0;
      const hoa = parseFloat(hoaFees) || 0;
      
      const [frontEndDti, backEndDti] = dtiRatio.split('/').map(parseFloat);

      const monthlyIncome = income / 12;

      // Calculate based on front-end DTI (housing costs)
      const maxMonthlyPaymentFrontEnd = monthlyIncome * (frontEndDti / 100);

      // Calculate based on back-end DTI (total debt)
      const maxMonthlyPaymentBackEnd = (monthlyIncome * (backEndDti / 100)) - debt;

      const maxMonthlyPayment = Math.min(maxMonthlyPaymentFrontEnd, maxMonthlyPaymentBackEnd);

      const monthlyRate = rate / 12 / 100;
      const numPayments = term * 12;

      // Iteratively find the affordable home price
      let low = 0;
      let high = income * 10; // A reasonable upper bound
      let mid = 0;

      for (let i = 0; i < 100; i++) { // 100 iterations for precision
          mid = (low + high) / 2;
          const loan = mid * (1 - downPayment);
          const p_i = (loan * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
          const taxes = (mid * taxRate) / 12;
          const insurance = (mid * insuranceRate) / 12;
          const totalPayment = p_i + taxes + insurance + hoa;

          if (totalPayment > maxMonthlyPayment) {
              high = mid;
          } else {
              low = mid;
          }
      }
      affordableHomePrice = low;

    } else { // Budget-based
      const budget = parseFloat(monthlyBudget) || 0;
      const rate = parseFloat(bbInterestRate) || 0;
      const term = parseInt(bbLoanTerm) || 0;
      const downPayment = parseFloat(bbDownPaymentPercent) / 100 || 0;
      const taxRate = parseFloat(bbPropertyTaxPercent) / 100 || 0;
      const insuranceRate = parseFloat(bbHomeInsurancePercent) / 100 || 0;
      const hoa = parseFloat(bbHoaFees) || 0;

      const monthlyRate = rate / 12 / 100;
      const numPayments = term * 12;
      
      // Iteratively find the affordable home price
      let low = 0;
      let high = budget * term * 12; // A reasonable upper bound
      let mid = 0;

      for (let i = 0; i < 100; i++) { // 100 iterations for precision
          mid = (low + high) / 2;
          const loan = mid * (1 - downPayment);
          const p_i = (loan * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
          const taxes = (mid * taxRate) / 12;
          const insurance = (mid * insuranceRate) / 12;
          const totalPayment = p_i + taxes + insurance + hoa;

          if (totalPayment > budget) {
              high = mid;
          } else {
              low = mid;
          }
      }
      affordableHomePrice = low;
    }

    if(affordableHomePrice > 0) {
        const finalDownPaymentPercent = activeTab === 'income' ? downPaymentPercent : bbDownPaymentPercent;
        const finalTaxPercent = activeTab === 'income' ? propertyTaxPercent : bbPropertyTaxPercent;
        const finalInsurancePercent = activeTab === 'income' ? homeInsurancePercent : bbHomeInsurancePercent;
        const finalHoa = activeTab === 'income' ? hoaFees : bbHoaFees;

        const loan = affordableHomePrice * (1 - (parseFloat(finalDownPaymentPercent) / 100));
        const p_i = loan * ((parseFloat(interestRate) / 12 / 100) * Math.pow(1 + (parseFloat(interestRate) / 12 / 100), parseInt(loanTerm) * 12)) / (Math.pow(1 + (parseFloat(interestRate) / 12 / 100), parseInt(loanTerm) * 12) - 1);
        const taxes = (affordableHomePrice * (parseFloat(finalTaxPercent) / 100)) / 12;
        const insurance = (affordableHomePrice * (parseFloat(finalInsurancePercent) / 100)) / 12;
        const monthlyPayment = p_i + taxes + insurance + parseFloat(finalHoa);
        
        setResults({
            affordableHomePrice,
            loanAmount: loan,
            monthlyPayment: monthlyPayment,
            principalAndInterest: p_i,
            propertyTaxes: taxes,
            homeInsurance: insurance,
            hoa: parseFloat(finalHoa),
        });
    } else {
        setResults(null);
    }
  };

  const chartConfig = {
    p_i: { label: 'Principal & Interest', color: 'hsl(var(--chart-2))' },
    taxes: { label: 'Property Tax', color: 'hsl(var(--chart-3))' },
    insurance: { label: 'Home Insurance', color: 'hsl(var(--chart-5))' },
    hoa: { label: 'HOA Fees', color: 'hsl(var(--chart-1))' },
  };

  const pieChartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'p_i', value: results.principalAndInterest, fill: 'var(--color-p_i)' },
      { name: 'taxes', value: results.propertyTaxes, fill: 'var(--color-taxes)' },
      { name: 'insurance', value: results.homeInsurance, fill: 'var(--color-insurance)' },
      { name: 'hoa', value: results.hoa, fill: 'var(--color-hoa)' },
    ].filter(item => item.value > 0);
  }, [results]);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">House Affordability Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">How Much House Can You Afford?</CardTitle>
              <CardDescription>
                Estimate an affordable home purchase amount based on your income or a fixed monthly budget.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-lg">
                  <TabsTrigger value="income">Based on Income</TabsTrigger>
                  <TabsTrigger value="budget">Based on Budget</TabsTrigger>
                </TabsList>
                
                <TabsContent value="income" className="m-0 pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="annual-income">Annual Household Income ($)</Label>
                            <Input id="annual-income" type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="monthly-debt">Monthly Debt Payback ($)</Label>
                            <Input id="monthly-debt" type="number" value={monthlyDebt} onChange={e => setMonthlyDebt(e.target.value)} placeholder="Car, student loans, etc." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="loan-term">Loan Term (Years)</Label>
                                <Input id="loan-term" type="number" value={loanTerm} onChange={e => setLoanTerm(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                                <Input id="interest-rate" type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="down-payment">Down Payment (%)</Label>
                            <Input id="down-payment" type="number" value={downPaymentPercent} onChange={e => setDownPaymentPercent(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>DTI Ratio</Label>
                             <Select value={dtiRatio} onValueChange={setDtiRatio}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="28/36">Conventional Loan (28/36)</SelectItem>
                                    <SelectItem value="31/43">FHA Loan (31/43)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="property-tax">Property Tax (% of home value/year)</Label>
                            <Input id="property-tax" type="number" value={propertyTaxPercent} onChange={e => setPropertyTaxPercent(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="home-insurance">Home Insurance (% of home value/year)</Label>
                            <Input id="home-insurance" type="number" value={homeInsurancePercent} onChange={e => setHomeInsurancePercent(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="hoa-fees">HOA Fees ($ / month)</Label>
                            <Input id="hoa-fees" type="number" value={hoaFees} onChange={e => setHoaFees(e.target.value)} />
                        </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="budget" className="m-0 pt-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bb-monthly-budget">Budget for House ($ / month)</Label>
                            <Input id="bb-monthly-budget" type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="bb-loan-term">Loan Term (Years)</Label>
                                <Input id="bb-loan-term" type="number" value={bbLoanTerm} onChange={e => setBbLoanTerm(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bb-interest-rate">Interest Rate (%)</Label>
                                <Input id="bb-interest-rate" type="number" value={bbInterestRate} onChange={e => setBbInterestRate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bb-down-payment">Down Payment (%)</Label>
                            <Input id="bb-down-payment" type="number" value={bbDownPaymentPercent} onChange={e => setBbDownPaymentPercent(e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bb-property-tax">Property Tax (% of home value/year)</Label>
                            <Input id="bb-property-tax" type="number" value={bbPropertyTaxPercent} onChange={e => setBbPropertyTaxPercent(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bb-home-insurance">Home Insurance (% of home value/year)</Label>
                            <Input id="bb-home-insurance" type="number" value={bbHomeInsurancePercent} onChange={e => setBbHomeInsurancePercent(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="bb-hoa-fees">HOA Fees ($ / month)</Label>
                            <Input id="bb-hoa-fees" type="number" value={bbHoaFees} onChange={e => setBbHoaFees(e.target.value)} />
                        </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <Button onClick={calculateAffordability} className="mt-6 w-full md:w-auto">Calculate</Button>
            </CardContent>
          </Card>

          {results && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Affordability Results</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
                        <div className="text-center">
                            <Label>Affordable Home Price</Label>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(results.affordableHomePrice)}</p>
                        </div>
                        <div className="w-full space-y-2 text-sm">
                            <div className="flex justify-between"><span>Loan Amount:</span> <span className="font-semibold">{formatCurrency(results.loanAmount)}</span></div>
                            <div className="flex justify-between border-t pt-2 mt-2 font-bold"><span>Total Monthly Payment:</span> <span>{formatCurrency(results.monthlyPayment)}</span></div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                         <h4 className="text-center font-semibold mb-2">Monthly Payment Breakdown</h4>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-xs">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                    {pieChartData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                            </PieChart>
                        </ChartContainer>
                    </div>
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
                        <AccordionTrigger>What is the Debt-to-Income (DTI) ratio?</AccordionTrigger>
                        <AccordionContent>
                        DTI is a percentage that shows how much of your gross monthly income goes towards paying your monthly debt payments. Lenders use it to assess your ability to manage monthly payments and repay debts. There are two parts: the front-end ratio (housing costs) and the back-end ratio (all debts).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is the 28/36 rule for conventional loans?</AccordionTrigger>
                        <AccordionContent>
                        This is a common guideline used by lenders for conventional loans. It suggests that your housing expenses (principal, interest, taxes, insurance - PITI) should not exceed 28% of your gross monthly income. Your total debt payments (including housing, car loans, student loans, etc.) should not exceed 36%.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>How does a down payment affect affordability?</AccordionTrigger>
                        <AccordionContent>
                        A larger down payment reduces the total amount you need to borrow (the principal). This lowers your monthly mortgage payment, which can help you qualify for a more expensive home. It can also help you avoid Private Mortgage Insurance (PMI).
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What other costs should I consider besides the mortgage?</AccordionTrigger>
                        <AccordionContent>
                        Your total monthly housing cost is more than just the mortgage payment. You must also budget for property taxes, homeowners insurance, potential Homeowners Association (HOA) fees, and regular maintenance and repairs. This calculator includes these factors.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Why is the interest rate so important?</AccordionTrigger>
                        <AccordionContent>
                        The interest rate determines how much you pay to borrow the money. Even a small difference in the interest rate can significantly change your monthly payment and the total amount of interest you pay over the life of the loan.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
           </Card>

        </div>
      </main>
    </TooltipProvider>
  );
}

    