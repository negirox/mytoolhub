
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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

interface YearData {
    year: number;
    buyingCost: number;
    rentingCost: number;
}

export default function RentVsBuyCalculatorPage() {
  const currencyContext = useContext(CurrencyContext);
  if (!currencyContext) {
    throw new Error('useContext must be used within a CurrencyProvider');
  }
  const { globalCurrency } = currencyContext;
  const [currency, setCurrency] = useState<Currency>(globalCurrency);

  // Home Purchase
  const [homePrice, setHomePrice] = useState('500000');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [interestRate, setInterestRate] = useState('6.565');
  const [loanTerm, setLoanTerm] = useState('30');
  const [buyingClosingCostsPercent, setBuyingClosingCostsPercent] = useState('2');
  const [propertyTaxPercent, setPropertyTaxPercent] = useState('1.5');
  const [homeInsurance, setHomeInsurance] = useState('2500');
  const [maintenanceCostPercent, setMaintenanceCostPercent] = useState('1.5');
  const [homeValueAppreciationPercent, setHomeValueAppreciationPercent] = useState('3');
  const [costIncreasePercent, setCostIncreasePercent] = useState('3');
  const [sellingClosingCostsPercent, setSellingClosingCostsPercent] = useState('7');

  // Home Rent
  const [monthlyRent, setMonthlyRent] = useState('3000');
  const [rentIncreasePercent, setRentIncreasePercent] = useState('3');
  const [rentersInsurance, setRentersInsurance] = useState('15');
  const [securityDeposit, setSecurityDeposit] = useState('3000');

  // User Info
  const [investmentReturnPercent, setInvestmentReturnPercent] = useState('5');
  const [taxRate, setTaxRate] = useState('25');

  const [results, setResults] = useState<{
    breakEvenYear: number | null;
    comparisonData: YearData[];
  } | null>(null);

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
  
  const calculate = () => {
    const pHomePrice = parseFloat(homePrice);
    const pDownPaymentPercent = parseFloat(downPaymentPercent) / 100;
    const pInterestRate = parseFloat(interestRate) / 100;
    const pLoanTermYears = parseInt(loanTerm);
    const pBuyingClosingCostsPercent = parseFloat(buyingClosingCostsPercent) / 100;
    const pPropertyTaxPercent = parseFloat(propertyTaxPercent) / 100;
    const pHomeInsurance = parseFloat(homeInsurance);
    const pMaintenanceCostPercent = parseFloat(maintenanceCostPercent) / 100;
    const pHomeValueAppreciationPercent = parseFloat(homeValueAppreciationPercent) / 100;
    const pCostIncreasePercent = parseFloat(costIncreasePercent) / 100;
    const pSellingClosingCostsPercent = parseFloat(sellingClosingCostsPercent) / 100;

    const pMonthlyRent = parseFloat(monthlyRent);
    const pRentIncreasePercent = parseFloat(rentIncreasePercent) / 100;
    const pRentersInsurance = parseFloat(rentersInsurance);
    const pSecurityDeposit = parseFloat(securityDeposit);

    const pInvestmentReturnPercent = parseFloat(investmentReturnPercent) / 100;
    const pTaxRate = parseFloat(taxRate) / 100;

    const downPayment = pHomePrice * pDownPaymentPercent;
    const loanAmount = pHomePrice - downPayment;
    const buyingClosingCosts = pHomePrice * pBuyingClosingCostsPercent;
    const upfrontBuyingCost = downPayment + buyingClosingCosts;

    const monthlyInterestRate = pInterestRate / 12;
    const loanTermMonths = pLoanTermYears * 12;
    const monthlyMortgage = loanAmount > 0 && monthlyInterestRate > 0 ? (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths)) : 0;
    
    let cumulativeBuyingCost = upfrontBuyingCost;
    let cumulativeRentingCost = pSecurityDeposit;
    let homeValue = pHomePrice;
    let loanBalance = loanAmount;
    let currentRent = pMonthlyRent;
    let currentHomeInsurance = pHomeInsurance;
    
    const comparisonData: YearData[] = [];
    let breakEvenYear: number | null = null;
    
    const opportunityCostOnUpfront = upfrontBuyingCost * pInvestmentReturnPercent;
    cumulativeBuyingCost += opportunityCostOnUpfront;
    
    for (let year = 1; year <= 30; year++) {
        let annualMortgagePaid = 0;
        let interestPaid = 0;

        if (loanAmount > 0) {
            for (let month = 1; month <= 12; month++) {
                const monthlyInterestPaid = loanBalance * monthlyInterestRate;
                const monthlyPrincipalPaid = monthlyMortgage - monthlyInterestPaid;
                interestPaid += monthlyInterestPaid;
                loanBalance -= monthlyPrincipalPaid;
                annualMortgagePaid += monthlyMortgage;
            }
        }
        
        const propertyTax = homeValue * pPropertyTaxPercent;
        const maintenance = homeValue * pMaintenanceCostPercent;
        const taxSavings = (interestPaid + propertyTax) * pTaxRate;
        const annualBuyingCost = annualMortgagePaid + propertyTax + currentHomeInsurance + maintenance - taxSavings;

        homeValue *= (1 + pHomeValueAppreciationPercent);
        const equity = homeValue - loanBalance;
        
        const annualRentingCost = (currentRent * 12) + (pRentersInsurance * 12);
        
        cumulativeBuyingCost += annualBuyingCost;
        cumulativeRentingCost += annualRentingCost;

        const averageMonthlyBuyingCost = (cumulativeBuyingCost - equity) / (year * 12);
        const averageMonthlyRentingCost = (cumulativeRentingCost - pSecurityDeposit) / (year * 12);
        
        comparisonData.push({
            year,
            buyingCost: averageMonthlyBuyingCost,
            rentingCost: averageMonthlyRentingCost,
        });
        
        if (breakEvenYear === null && averageMonthlyBuyingCost < averageMonthlyRentingCost) {
            breakEvenYear = year;
        }
        
        currentRent *= (1 + pRentIncreasePercent);
        currentHomeInsurance *= (1 + pCostIncreasePercent);
    }

    setResults({ breakEvenYear, comparisonData });
  };
  
  const chartData = useMemo(() => results?.comparisonData, [results]);

  const chartConfig = {
      buyingCost: { label: 'Average Buying Cost', color: 'hsl(var(--chart-1))' },
      rentingCost: { label: 'Average Renting Cost', color: 'hsl(var(--chart-2))' },
  }

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Rent vs. Buy Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Rent vs. Buy Calculator</CardTitle>
              <CardDescription>
                Compare the long-term financial implications of renting a home versus buying one.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 max-w-xs">
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
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                    <Card><CardHeader><CardTitle className="text-lg">Home Purchase Details</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Home price</Label><Input value={homePrice} onChange={e=>setHomePrice(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Down payment (%)</Label><Input value={downPaymentPercent} onChange={e=>setDownPaymentPercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Interest rate (%)</Label><Input value={interestRate} onChange={e=>setInterestRate(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Loan term (years)</Label><Input value={loanTerm} onChange={e=>setLoanTerm(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Buying closing costs (%)</Label><Input value={buyingClosingCostsPercent} onChange={e=>setBuyingClosingCostsPercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Property tax (%/year)</Label><Input value={propertyTaxPercent} onChange={e=>setPropertyTaxPercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Home insurance ({currencySymbols[currency]}/year)</Label><Input value={homeInsurance} onChange={e=>setHomeInsurance(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Maintenance cost (%/year)</Label><Input value={maintenanceCostPercent} onChange={e=>setMaintenanceCostPercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Appreciation (%/year)</Label><Input value={homeValueAppreciationPercent} onChange={e=>setHomeValueAppreciationPercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Cost increase (%/year)</Label><Input value={costIncreasePercent} onChange={e=>setCostIncreasePercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Selling closing costs (%)</Label><Input value={sellingClosingCostsPercent} onChange={e=>setSellingClosingCostsPercent(e.target.value)}/></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card><CardHeader><CardTitle className="text-lg">Home Rent Details</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Monthly rental fee</Label><Input value={monthlyRent} onChange={e=>setMonthlyRent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Rental fee increase (%/year)</Label><Input value={rentIncreasePercent} onChange={e=>setRentIncreasePercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Renter's insurance ({currencySymbols[currency]}/month)</Label><Input value={rentersInsurance} onChange={e=>setRentersInsurance(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Security deposit</Label><Input value={securityDeposit} onChange={e=>setSecurityDeposit(e.target.value)}/></div>
                        </CardContent>
                    </Card>
                    <Card><CardHeader><CardTitle className="text-lg">Your Financial Information</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Avg. investment return (%)</Label><Input value={investmentReturnPercent} onChange={e=>setInvestmentReturnPercent(e.target.value)}/></div>
                            <div className="space-y-2"><Label>Marginal tax rate (%)</Label><Input value={taxRate} onChange={e=>setTaxRate(e.target.value)}/></div>
                        </CardContent>
                    </Card>
                    <Button onClick={calculate} className="w-full">Calculate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {results && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert className="border-primary">
                        <Info className="h-4 w-4" />
                        <AlertTitle className="font-semibold">
                            {results.breakEvenYear !== null ? `Buying is cheaper if you stay for ${results.breakEvenYear} years or longer.` : "Renting is cheaper for the entire 30-year period."}
                        </AlertTitle>
                    </Alert>
                    
                    <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                        <LineChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="year" tickFormatter={(v) => `${v}yr`} />
                            <YAxis tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)}/>} />
                            <Legend />
                            <Line type="monotone" dataKey="buyingCost" stroke="var(--color-buyingCost)" name="Average Buying Cost" dot={false} strokeWidth={2}/>
                            <Line type="monotone" dataKey="rentingCost" stroke="var(--color-rentingCost)" name="Average Renting Cost" dot={false} strokeWidth={2}/>
                        </LineChart>
                    </ChartContainer>

                    <div>
                        <h3 className="mb-2 font-semibold">Average Cost Breakdown by Length of Stay</h3>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Staying Length</TableHead>
                                        <TableHead colSpan={2} className="text-center">Average Buying Cost</TableHead>
                                        <TableHead colSpan={2} className="text-center">Average Renting Cost</TableHead>
                                    </TableRow>
                                     <TableRow>
                                        <TableHead></TableHead>
                                        <TableHead className="text-right">Monthly</TableHead>
                                        <TableHead className="text-right">Annual</TableHead>
                                        <TableHead className="text-right">Monthly</TableHead>
                                        <TableHead className="text-right">Annual</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.comparisonData.map(d => (
                                        <TableRow key={d.year}>
                                            <TableCell>{d.year} Year{d.year > 1 ? 's': ''}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(d.buyingCost)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(d.buyingCost * 12)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(d.rentingCost)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(d.rentingCost * 12)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is the "break-even point"?</AccordionTrigger>
                        <AccordionContent>
                        The break-even point is the moment in time when the total cost of owning a home becomes equal to the total cost of renting an equivalent home. After this point, buying becomes the cheaper option. It's a crucial factor in deciding whether to rent or buy based on how long you plan to stay in one place.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-2">
                        <AccordionTrigger>What hidden costs are involved in buying a home?</AccordionTrigger>
                        <AccordionContent>
                        Buying a home involves more than just the mortgage payment. This calculator includes key hidden costs like property taxes, homeowners insurance, and ongoing maintenance. It also factors in initial buying closing costs and eventual selling costs, which are often overlooked.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>How does home value appreciation affect the calculation?</AccordionTrigger>
                        <AccordionContent>
                        Home value appreciation is the increase in your property's value over time. It's a primary way homeowners build wealth (equity). This calculator treats appreciation as a financial gain that offsets the costs of ownership when determining the average monthly cost.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>What is "opportunity cost"?</AccordionTrigger>
                        <AccordionContent>
                        Opportunity cost is the potential return you miss out on when you choose one option over another. In this calculator, it refers to the investment returns you could have earned on the money used for a down payment and closing costs if you had invested it in the market instead of buying a home.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>Are there non-financial factors to consider?</AccordionTrigger>
                        <AccordionContent>
                        Absolutely. While this calculator focuses on the financial aspect, the decision to rent or buy also involves personal preferences. Owning a home offers stability and the freedom to customize your space, while renting offers flexibility and fewer responsibilities for maintenance and repairs.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">
                    Disclaimer: This calculator is for illustrative purposes. Financial markets, real estate values, and tax laws can change. Consult with a qualified financial advisor for personalized advice.
                </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
