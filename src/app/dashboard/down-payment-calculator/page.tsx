
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
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

export default function DownPaymentCalculatorPage() {
    const currencyContext = useContext(CurrencyContext);
    if (!currencyContext) {
        throw new Error('useContext must be used within a CurrencyProvider');
    }
    const { globalCurrency } = currencyContext;

    const [activeTab, setActiveTab] = useState('cash');
    const [currency, setCurrency] = useState<Currency>(globalCurrency);

    // Common State
    const [interestRate, setInterestRate] = useState('6.565');
    const [loanTerm, setLoanTerm] = useState('30');
    const [closingCostPercent, setClosingCostPercent] = useState('3');

    // Tab 1: Use Upfront Cash
    const [upfrontCash, setUpfrontCash] = useState('100000');
    const [downPaymentCashPercent, setDownPaymentCashPercent] = useState('20');
    const [cashResults, setCashResults] = useState<any>(null);
    const [otherScenarios, setOtherScenarios] = useState<any[]>([]);

    // Tab 2: Use Home Price
    const [homePrice, setHomePrice] = useState('500000');
    const [downPaymentPricePercent, setDownPaymentPricePercent] = useState('20');
    const [priceResults, setPriceResults] = useState<any>(null);

    // Tab 3: Use Home Price & Cash
    const [hpacHomePrice, setHpacHomePrice] = useState('500000');
    const [hpacUpfrontCash, setHpacUpfrontCash] = useState('100000');
    const [hpacResults, setHpacResults] = useState<any>(null);

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

    const calculateMonthlyPayment = (loanAmount: number, rate: number, term: number) => {
        const monthlyRate = rate / 12 / 100;
        const numPayments = term * 12;
        if (monthlyRate <= 0) return loanAmount / numPayments;
        return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    };
    
    const calculateForCash = () => {
        const cash = parseFloat(upfrontCash) || 0;
        const dpPercent = parseFloat(downPaymentCashPercent) / 100 || 0;
        const ccPercent = parseFloat(closingCostPercent) / 100 || 0;
        const rate = parseFloat(interestRate) || 0;
        const term = parseInt(loanTerm) || 0;

        if (cash <= 0 || dpPercent + ccPercent <= 0) return;
        
        const affordableHomePrice = cash / (dpPercent + ccPercent);
        const downPayment = affordableHomePrice * dpPercent;
        const closingCosts = affordableHomePrice * ccPercent;
        const loanAmount = affordableHomePrice - downPayment;
        const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, term);
        
        setCashResults({ affordableHomePrice, downPayment, closingCosts, loanAmount, monthlyPayment });

        // Calculate other scenarios
        const scenarios = [3.5, 5, 10, 15, 20];
        const scenarioResults = scenarios.map(scenarioDpPercent => {
            const homePrice = cash / ((scenarioDpPercent/100) + ccPercent);
            const dp = homePrice * (scenarioDpPercent/100);
            const cc = homePrice * ccPercent;
            const loan = homePrice - dp;
            const payment = calculateMonthlyPayment(loan, rate, term);
            return {
                dpPercentage: scenarioDpPercent,
                homePrice: homePrice,
                downPayment: dp,
                closingCosts: cc,
                loanAmount: loan,
                monthlyPayment: payment
            };
        });
        setOtherScenarios(scenarioResults.reverse());
    };

    const calculateForPrice = () => {
        const price = parseFloat(homePrice) || 0;
        const dpPercent = parseFloat(downPaymentPricePercent) / 100 || 0;
        const ccPercent = parseFloat(closingCostPercent) / 100 || 0;
        const rate = parseFloat(interestRate) || 0;
        const term = parseInt(loanTerm) || 0;

        if (price <= 0) return;

        const downPayment = price * dpPercent;
        const closingCosts = price * ccPercent;
        const cashNeeded = downPayment + closingCosts;
        const loanAmount = price - downPayment;
        const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, term);

        setPriceResults({ 
            downPayment, 
            closingCosts, 
            cashNeeded, 
            loanAmount, 
            monthlyPayment,
            pieData: [
                { name: 'downPayment', value: downPayment, fill: 'var(--color-downPayment)' },
                { name: 'closingCosts', value: closingCosts, fill: 'var(--color-closingCosts)' },
            ]
        });
    };

    const calculateForHpac = () => {
        const price = parseFloat(hpacHomePrice) || 0;
        const cash = parseFloat(hpacUpfrontCash) || 0;
        const ccPercent = parseFloat(closingCostPercent) / 100 || 0;
        const rate = parseFloat(interestRate) || 0;
        const term = parseInt(loanTerm) || 0;

        if (price <= 0 || cash <= 0) return;

        const closingCosts = price * ccPercent;
        const downPayment = cash - closingCosts;
        const downPaymentPercentResult = (downPayment / price) * 100;
        const loanAmount = price - downPayment;
        const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, term);
        
        if (downPayment > 0) {
            setHpacResults({ 
                downPayment, 
                downPaymentPercent: downPaymentPercentResult, 
                closingCosts, 
                loanAmount, 
                monthlyPayment,
                pieData: [
                    { name: 'downPayment', value: downPayment, fill: 'var(--color-downPayment)' },
                    { name: 'closingCosts', value: closingCosts, fill: 'var(--color-closingCosts)' },
                ]
            });
        } else {
            setHpacResults(null);
        }
    };

  const chartConfig = {
    downPayment: { label: 'Down Payment', color: 'hsl(var(--chart-2))' },
    closingCosts: { label: 'Closing Costs', color: 'hsl(var(--chart-5))' },
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Down Payment Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Home Down Payment Calculator
              </CardTitle>
              <CardDescription>
                Use one of the calculators below to estimate your down payment needs from different angles.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                        <Input id="interest-rate" value={interestRate} onChange={e=>setInterestRate(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="loan-term">Loan Term (Years)</Label>
                        <Input id="loan-term" value={loanTerm} onChange={e=>setLoanTerm(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="closing-cost">Closing Costs (%)</Label>
                        <Input id="closing-cost" value={closingCostPercent} onChange={e=>setClosingCostPercent(e.target.value)} />
                    </div>
                </div>

                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                      <TabsTrigger value="cash">Use Upfront Cash</TabsTrigger>
                      <TabsTrigger value="price">Use Home Price</TabsTrigger>
                      <TabsTrigger value="hpac">Use Price & Cash</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="cash" className="mt-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Calculate Affordable Home Price</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Upfront Cash Available</Label><Input value={upfrontCash} onChange={e=>setUpfrontCash(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Down Payment (%)</Label><Input value={downPaymentCashPercent} onChange={e=>setDownPaymentCashPercent(e.target.value)} /></div>
                            </CardContent>
                            <CardContent> <Button onClick={calculateForCash}>Calculate</Button></CardContent>
                             {cashResults && (
                                <CardContent>
                                    <h3 className="font-bold text-xl text-primary mb-2">Home Price: {formatCurrency(cashResults.affordableHomePrice)}</h3>
                                    <div className="text-sm space-y-1">
                                        <p>Down Payment: {formatCurrency(cashResults.downPayment)}</p>
                                        <p>Closing Costs: {formatCurrency(cashResults.closingCosts)}</p>
                                        <p>Loan Amount: {formatCurrency(cashResults.loanAmount)}</p>
                                        <p>Monthly Payment: {formatCurrency(cashResults.monthlyPayment)}</p>
                                    </div>
                                    <h4 className="font-semibold text-lg mt-6 mb-2">Results for other possible down payment percentages</h4>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Down Payment</TableHead>
                                                    <TableHead>Home Price</TableHead>
                                                    <TableHead>Down Payment Amount</TableHead>
                                                    <TableHead>Closing Costs</TableHead>
                                                    <TableHead>Loan Amount</TableHead>
                                                    <TableHead>Monthly Payment</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {otherScenarios.map(s => (
                                                <TableRow key={s.dpPercentage}>
                                                    <TableCell>{s.dpPercentage}% {s.dpPercentage === 3.5 && "(FHA)"}</TableCell>
                                                    <TableCell>{formatCurrency(s.homePrice)}</TableCell>
                                                    <TableCell>{formatCurrency(s.downPayment)}</TableCell>
                                                    <TableCell>{formatCurrency(s.closingCosts)}</TableCell>
                                                    <TableCell>{formatCurrency(s.loanAmount)}</TableCell>
                                                    <TableCell>{formatCurrency(s.monthlyPayment)}</TableCell>
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="price" className="mt-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Calculate Cash Needed</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Home Price</Label><Input value={homePrice} onChange={e=>setHomePrice(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Down Payment (%)</Label><Input value={downPaymentPricePercent} onChange={e=>setDownPaymentPricePercent(e.target.value)} /></div>
                            </CardContent>
                             <CardContent><Button onClick={calculateForPrice}>Calculate</Button></CardContent>
                             {priceResults && (
                                <CardContent className="grid md:grid-cols-2 gap-4 items-center">
                                    <div>
                                        <h3 className="font-bold text-xl text-primary mb-2">Cash Needed: {formatCurrency(priceResults.cashNeeded)}</h3>
                                        <div className="text-sm space-y-1">
                                            <p>Down Payment: {formatCurrency(priceResults.downPayment)}</p>
                                            <p>Closing Costs: {formatCurrency(priceResults.closingCosts)}</p>
                                            <p>Loan Amount: {formatCurrency(priceResults.loanAmount)}</p>
                                            <p>Monthly Payment: {formatCurrency(priceResults.monthlyPayment)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                       <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-xs">
                                           <PieChart>
                                               <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                               <Pie data={priceResults.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} label>
                                                   {priceResults.pieData.map((entry: any) => (<Cell key={entry.name} fill={entry.fill} />))}
                                               </Pie>
                                               <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                                           </PieChart>
                                       </ChartContainer>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="hpac" className="mt-4">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Calculate Down Payment Percentage</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Home Price</Label><Input value={hpacHomePrice} onChange={e=>setHpacHomePrice(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Upfront Cash Available</Label><Input value={hpacUpfrontCash} onChange={e=>setHpacUpfrontCash(e.target.value)} /></div>
                            </CardContent>
                            <CardContent><Button onClick={calculateForHpac}>Calculate</Button></CardContent>
                            {hpacResults ? (
                                <CardContent className="grid md:grid-cols-2 gap-4 items-center">
                                    <div>
                                        <h3 className="font-bold text-xl text-primary mb-2">Down Payment: {hpacResults.downPaymentPercent.toFixed(1)}%</h3>
                                        <div className="text-sm space-y-1">
                                            <p>Down Payment Amount: {formatCurrency(hpacResults.downPayment)}</p>
                                            <p>Closing Costs: {formatCurrency(hpacResults.closingCosts)}</p>
                                            <p>Loan Amount: {formatCurrency(hpacResults.loanAmount)}</p>
                                            <p>Monthly Payment: {formatCurrency(hpacResults.monthlyPayment)}</p>
                                        </div>
                                         {hpacResults.downPaymentPercent < 20 && (
                                            <Alert className="mt-4">
                                                <AlertDescription>
                                                    Since the down payment is less than 20%, you will likely be required to pay for Private Mortgage Insurance (PMI).
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                     <div className="flex items-center justify-center">
                                       <ChartContainer config={chartConfig} className="min-h-[200px] w-full max-w-xs">
                                           <PieChart>
                                               <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                               <Pie data={hpacResults.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} label>
                                                   {hpacResults.pieData.map((entry: any) => (<Cell key={entry.name} fill={entry.fill} />))}
                                               </Pie>
                                               <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                                           </PieChart>
                                       </ChartContainer>
                                    </div>
                                </CardContent>
                            ) : (
                                hpacUpfrontCash > '0' && hpacHomePrice > '0' && (
                                     <CardContent>
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                The cash available is not enough to cover the closing costs.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                )
                            )}
                        </Card>
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
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is a down payment?</AccordionTrigger>
                        <AccordionContent>
                        A down payment is an initial, upfront partial payment for the purchase of an expensive item like a house. It is usually paid in cash or equivalent at the time of finalizing the transaction. The remaining amount is typically financed through a loan from a bank or other lender.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How much should I put down on a house?</AccordionTrigger>
                        <AccordionContent>
                        While 20% is often cited as the ideal down payment to avoid Private Mortgage Insurance (PMI), many loan programs allow for much less. For example, FHA loans require as little as 3.5% down. The right amount depends on your financial situation, the loan type, and your goals.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What are closing costs?</AccordionTrigger>
                        <AccordionContent>
                        Closing costs are fees associated with finalizing your mortgage. They typically range from 2% to 5% of the loan amount and can include appraisal fees, title insurance, attorney fees, and loan origination fees. These are paid at the end of the home-buying process.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>What is Private Mortgage Insurance (PMI)?</AccordionTrigger>
                        <AccordionContent>
                        PMI is a type of mortgage insurance you might be required to pay for a conventional loan if you make a down payment of less than 20%. It protects the lender—not you—in case you stop making payments on your loan. It's usually added to your monthly mortgage payment.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                        <AccordionTrigger>Can I get a loan with 0% down?</AccordionTrigger>
                        <AccordionContent>
                        Yes, some loan programs offer 0% down payments, but they are not common. VA loans (for eligible veterans and service members) and USDA loans (for eligible rural homebuyers) are two primary examples of loans that may not require a down payment.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-6">
                        <AccordionTrigger>Does a larger down payment save money?</AccordionTrigger>
                        <AccordionContent>
                        Absolutely. A larger down payment reduces your loan principal, which means you'll have a lower monthly payment and pay significantly less in total interest over the life of the loan. It can also help you secure a better interest rate and avoid PMI.
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
