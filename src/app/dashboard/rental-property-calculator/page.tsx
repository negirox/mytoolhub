
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

interface YearData {
    year: number;
    annualIncome: number;
    mortgage: number;
    expenses: number;
    cashFlow: number;
    cashOnCashReturn: number;
    equityAccumulated: number;
    ifSoldCash: number;
}

export default function RentalPropertyCalculatorPage() {
    const currencyContext = useContext(CurrencyContext);
    if (!currencyContext) {
        throw new Error('useContext must be used within a CurrencyProvider');
    }
    const { globalCurrency } = currencyContext;
    const [currency, setCurrency] = useState<Currency>(globalCurrency);

    // Purchase
    const [purchasePrice, setPurchasePrice] = useState('200000');
    const [useLoan, setUseLoan] = useState(true);
    const [downPaymentPercent, setDownPaymentPercent] = useState('20');
    const [interestRate, setInterestRate] = useState('6');
    const [loanTerm, setLoanTerm] = useState('30');
    const [closingCost, setClosingCost] = useState('6000');
    
    // Expenses
    const [propertyTax, setPropertyTax] = useState('3000');
    const [propertyTaxIncrease, setPropertyTaxIncrease] = useState('3');
    const [insurance, setInsurance] = useState('1200');
    const [insuranceIncrease, setInsuranceIncrease] = useState('3');
    const [maintenance, setMaintenance] = useState('2000');
    const [maintenanceIncrease, setMaintenanceIncrease] = useState('3');
    const [hoa, setHoa] = useState('0');
    const [hoaIncrease, setHoaIncrease] = useState('3');
    const [otherCosts, setOtherCosts] = useState('500');
    const [otherCostsIncrease, setOtherCostsIncrease] = useState('3');

    // Income
    const [monthlyRent, setMonthlyRent] = useState('2000');
    const [rentIncrease, setRentIncrease] = useState('3');
    const [otherIncome, setOtherIncome] = useState('0');
    const [otherIncomeIncrease, setOtherIncomeIncrease] = useState('3');
    const [vacancyRate, setVacancyRate] = useState('5');
    const [managementFee, setManagementFee] = useState('0');

    // Sale
    const [holdingLength, setHoldingLength] = useState('20');
    const [appreciation, setAppreciation] = useState('3');
    const [sellCost, setSellCost] = useState('8');

    // Results
    const [results, setResults] = useState<any>(null);
    const [yearByYearData, setYearByYearData] = useState<YearData[]>([]);

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
        const pPrice = parseFloat(purchasePrice) || 0;
        const downPmtPercent = parseFloat(downPaymentPercent) / 100 || 0;
        const cCost = parseFloat(closingCost) || 0;
        
        const downPayment = pPrice * downPmtPercent;
        const loanAmount = useLoan ? pPrice - downPayment : 0;
        const initialCashInvestment = downPayment + cCost;

        const iRate = parseFloat(interestRate) / 100 / 12 || 0;
        const lTermMonths = (parseFloat(loanTerm) || 0) * 12;

        const monthlyMortgage = useLoan && iRate > 0
            ? (loanAmount * iRate * Math.pow(1 + iRate, lTermMonths)) / (Math.pow(1 + iRate, lTermMonths) - 1)
            : (useLoan ? loanAmount / lTermMonths : 0);
        
        let yearlyRent = (parseFloat(monthlyRent) || 0) * 12;
        let yearlyOtherIncome = (parseFloat(otherIncome) || 0) * 12;
        let yearlyPropertyTax = parseFloat(propertyTax) || 0;
        let yearlyInsurance = parseFloat(insurance) || 0;
        let yearlyMaintenance = parseFloat(maintenance) || 0;
        let yearlyHoa = parseFloat(hoa) || 0;
        let yearlyOtherCosts = parseFloat(otherCosts) || 0;
        let currentPropertyValue = pPrice;

        const vacRate = parseFloat(vacancyRate) / 100 || 0;
        const mgmtFeeRate = parseFloat(managementFee) / 100 || 0;

        let totalRentalIncome = 0;
        let totalMortgage = 0;
        let totalExpenses = 0;
        let remainingBalance = loanAmount;
        let totalCashFlow = 0;

        const yearlyDetails: YearData[] = [];

        for (let year = 1; year <= parseFloat(holdingLength); year++) {
            const grossPotentialRent = yearlyRent + yearlyOtherIncome;
            const vacancyLoss = grossPotentialRent * vacRate;
            const effectiveGrossIncome = grossPotentialRent - vacancyLoss;
            const managementFeeCost = effectiveGrossIncome * mgmtFeeRate;

            const annualExpenses = yearlyPropertyTax + yearlyInsurance + yearlyMaintenance + yearlyHoa + yearlyOtherCosts + managementFeeCost + vacancyLoss;
            const noi = effectiveGrossIncome - annualExpenses + vacancyLoss; // NOI doesn't include vacancy loss or management fee in some definitions, but here it's gross income minus all operating expenses.
            
            let annualMortgage = 0;
            let interestPaid = 0;
            let principalPaid = 0;

            if(useLoan) {
                for(let month = 1; month <= 12; month++) {
                    const monthInterest = remainingBalance * iRate;
                    const monthPrincipal = monthlyMortgage - monthInterest;
                    interestPaid += monthInterest;
                    principalPaid += monthPrincipal;
                    remainingBalance -= monthPrincipal;
                    annualMortgage += monthlyMortgage;
                }
            }
            
            const cashFlow = noi - annualMortgage;
            
            const salePriceAtYearEnd = currentPropertyValue;
            const costToSellAmount = salePriceAtYearEnd * (parseFloat(sellCost) / 100 || 0);
            const profitOnSale = salePriceAtYearEnd - remainingBalance - costToSellAmount;
            const ifSoldCash = profitOnSale + downPayment;

            yearlyDetails.push({
                year: year,
                annualIncome: effectiveGrossIncome,
                mortgage: annualMortgage,
                expenses: annualExpenses,
                cashFlow,
                cashOnCashReturn: (cashFlow / initialCashInvestment) * 100,
                equityAccumulated: loanAmount - remainingBalance + downPayment,
                ifSoldCash,
            });
            
            totalRentalIncome += effectiveGrossIncome;
            totalMortgage += annualMortgage;
            totalExpenses += annualExpenses;
            totalCashFlow += cashFlow;

            // Increment for next year
            yearlyRent *= (1 + (parseFloat(rentIncrease) / 100 || 0));
            yearlyOtherIncome *= (1 + (parseFloat(otherIncomeIncrease) / 100 || 0));
            yearlyPropertyTax *= (1 + (parseFloat(propertyTaxIncrease) / 100 || 0));
            yearlyInsurance *= (1 + (parseFloat(insuranceIncrease) / 100 || 0));
            yearlyMaintenance *= (1 + (parseFloat(maintenanceIncrease) / 100 || 0));
            yearlyHoa *= (1 + (parseFloat(hoaIncrease) / 100 || 0));
            yearlyOtherCosts *= (1 + (parseFloat(otherCostsIncrease) / 100 || 0));
            currentPropertyValue *= (1 + (parseFloat(appreciation) / 100 || 0));
        }

        const firstYear = yearlyDetails[0];
        const finalPropertyValue = currentPropertyValue;
        const finalCostToSell = finalPropertyValue * (parseFloat(sellCost) / 100 || 0);
        const totalProfitWhenSold = totalCashFlow + (finalPropertyValue - remainingBalance - finalCostToSell) - initialCashInvestment + downPayment;

        setResults({
            totalProfitWhenSold,
            cashOnCashReturn: (totalCashFlow / initialCashInvestment) * 100,
            capRate: (firstYear.annualIncome - firstYear.expenses) / pPrice * 100,
            totalRentalIncome,
            totalMortgage,
            totalExpenses,
            totalNoi: totalRentalIncome - totalExpenses,
            firstYear,
            initialCashInvestment
        });
        setYearByYearData(yearlyDetails);
    };

    const expenseBreakdownChartData = useMemo(() => {
        if (!results || !results.firstYear) return [];
        const f = results.firstYear;
        const pTax = parseFloat(propertyTax);
        const ins = parseFloat(insurance);
        const maint = parseFloat(maintenance);
        const other = parseFloat(otherCosts);
        const vac = f.annualIncome / (1 - (parseFloat(vacancyRate)/100)) * (parseFloat(vacancyRate)/100);

        return [
          { name: 'Mortgage', value: f.mortgage, fill: 'var(--color-mortgage)' },
          { name: 'Vacancy', value: vac, fill: 'var(--color-vacancy)' },
          { name: 'Property Tax', value: pTax, fill: 'var(--color-propertyTax)' },
          { name: 'Total Insurance', value: ins, fill: 'var(--color-insurance)' },
          { name: 'Maintenance Cost', value: maint, fill: 'var(--color-maintenance)' },
          { name: 'Other Cost', value: other, fill: 'var(--color-other)' },
        ].filter(item => item.value > 0);
    }, [results]);

    const expenseChartConfig = {
        mortgage: { label: 'Mortgage', color: 'hsl(var(--chart-1))' },
        vacancy: { label: 'Vacancy', color: 'hsl(var(--chart-2))' },
        propertyTax: { label: 'Property Tax', color: 'hsl(var(--chart-3))' },
        insurance: { label: 'Total Insurance', color: 'hsl(var(--chart-4))' },
        maintenance: { label: 'Maintenance Cost', color: 'hsl(var(--chart-5))' },
        other: { label: 'Other Cost', color: 'hsl(var(--chart-6))' },
    }

    return (
        <>
          <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
            <h1 className="font-headline text-xl font-semibold">Rental Property Calculator</h1>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Rental Property ROI Calculator</CardTitle>
                        <CardDescription>Analyze the potential return on investment for a rental property.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Purchase</CardTitle></CardHeader>
                                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Purchase Price</Label><Input value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Closing Cost</Label><Input value={closingCost} onChange={e => setClosingCost(e.target.value)} /></div>
                                    <div className="flex items-center space-x-2 pt-4"><Switch id="use-loan" checked={useLoan} onCheckedChange={setUseLoan} /><Label htmlFor="use-loan">Use Loan?</Label></div>
                                    <div className="space-y-2"><Label>Down Payment (%)</Label><Input value={downPaymentPercent} onChange={e => setDownPaymentPercent(e.target.value)} disabled={!useLoan} /></div>
                                    <div className="space-y-2"><Label>Interest Rate (%)</Label><Input value={interestRate} onChange={e => setInterestRate(e.target.value)} disabled={!useLoan} /></div>
                                    <div className="space-y-2"><Label>Loan Term (years)</Label><Input value={loanTerm} onChange={e => setLoanTerm(e.target.value)} disabled={!useLoan} /></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Income</CardTitle></CardHeader>
                                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Monthly Rent</Label><Input value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={rentIncrease} onChange={e => setRentIncrease(e.target.value)} /></div>
                                    <div className="space-y-2 self-end text-sm text-muted-foreground hidden lg:block"></div>
                                    <div className="space-y-2"><Label>Other Monthly Income</Label><Input value={otherIncome} onChange={e => setOtherIncome(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={otherIncomeIncrease} onChange={e => setOtherIncomeIncrease(e.target.value)} /></div>
                                    <div className="space-y-2 self-end text-sm text-muted-foreground hidden lg:block"></div>
                                    <div className="space-y-2"><Label>Vacancy Rate (%)</Label><Input value={vacancyRate} onChange={e => setVacancyRate(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Management Fee (% of rent)</Label><Input value={managementFee} onChange={e => setManagementFee(e.target.value)} /></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Recurring Operating Expenses</CardTitle></CardHeader>
                                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Property Tax (annual)</Label><Input value={propertyTax} onChange={e => setPropertyTax(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={propertyTaxIncrease} onChange={e => setPropertyTaxIncrease(e.target.value)} /></div>
                                    <div className="space-y-2 self-end text-sm text-muted-foreground hidden lg:block"></div>
                                    <div className="space-y-2"><Label>Total Insurance (annual)</Label><Input value={insurance} onChange={e => setInsurance(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={insuranceIncrease} onChange={e => setInsuranceIncrease(e.target.value)} /></div>
                                    <div className="space-y-2 self-end text-sm text-muted-foreground hidden lg:block"></div>
                                    <div className="space-y-2"><Label>Maintenance (annual)</Label><Input value={maintenance} onChange={e => setMaintenance(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={maintenanceIncrease} onChange={e => setMaintenanceIncrease(e.target.value)} /></div>
                                    <div className="space-y-2 self-end text-sm text-muted-foreground hidden lg:block"></div>
                                    <div className="space-y-2"><Label>HOA Fee (annual)</Label><Input value={hoa} onChange={e => setHoa(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={hoaIncrease} onChange={e => setHoaIncrease(e.target.value)} /></div>
                                    <div className="space-y-2 self-end text-sm text-muted-foreground hidden lg:block"></div>
                                    <div className="space-y-2"><Label>Other Costs (annual)</Label><Input value={otherCosts} onChange={e => setOtherCosts(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Annual Increase (%)</Label><Input value={otherCostsIncrease} onChange={e => setOtherCostsIncrease(e.target.value)} /></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Sale</CardTitle></CardHeader>
                                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Value Appreciation (% per year)</Label><Input value={appreciation} onChange={e => setAppreciation(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Holding Length (years)</Label><Input value={holdingLength} onChange={e => setHoldingLength(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Cost to Sell (%)</Label><Input value={sellCost} onChange={e => setSellCost(e.target.value)} /></div>
                                </CardContent>
                            </Card>
                             <div className="space-y-4">
                                <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                                    <SelectTrigger className="max-w-xs"><SelectValue placeholder="Select currency" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={calculate} className="w-full md:w-auto">Calculate</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {results && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Results Summary</CardTitle>
                                <CardDescription>For the {holdingLength} Years Invested</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between font-bold text-base"><p>Total Profit when Sold:</p><p>{formatCurrency(results.totalProfitWhenSold)}</p></div>
                                <div className="flex justify-between"><p>Cash on Cash Return:</p><p>{results.cashOnCashReturn.toFixed(2)}%</p></div>
                                <div className="flex justify-between"><p>Capitalization Rate:</p><p>{results.capRate.toFixed(2)}%</p></div>
                                <div className="flex justify-between"><p>Total Rental Income:</p><p>{formatCurrency(results.totalRentalIncome)}</p></div>
                                <div className="flex justify-between"><p>Total Mortgage Payments:</p><p>{formatCurrency(results.totalMortgage)}</p></div>
                                <div className="flex justify-between"><p>Total Expenses:</p><p>{formatCurrency(results.totalExpenses)}</p></div>
                                <div className="flex justify-between"><p>Total Net Operating Income:</p><p>{formatCurrency(results.totalNoi)}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">First Year Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold mb-2">Income & Expense Breakdown</h3>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Monthly</TableHead><TableHead className="text-right">Annual</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            <TableRow><TableCell>Income:</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.annualIncome/12)}</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.annualIncome)}</TableCell></TableRow>
                                            <TableRow><TableCell>Mortgage Pay:</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.mortgage/12)}</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.mortgage)}</TableCell></TableRow>
                                            <TableRow><TableCell>Vacancy ({vacancyRate}%):</TableCell><TableCell className="text-right">{formatCurrency((results.firstYear.annualIncome / (1- (parseFloat(vacancyRate)/100)) * (parseFloat(vacancyRate)/100))/12)}</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.annualIncome / (1- (parseFloat(vacancyRate)/100)) * (parseFloat(vacancyRate)/100))}</TableCell></TableRow>
                                            <TableRow><TableCell>Property Tax:</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(propertyTax)/12)}</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(propertyTax))}</TableCell></TableRow>
                                            <TableRow><TableCell>Total Insurance:</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(insurance)/12)}</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(insurance))}</TableCell></TableRow>
                                            <TableRow><TableCell>Maintenance Cost:</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(maintenance)/12)}</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(maintenance))}</TableCell></TableRow>
                                            <TableRow><TableCell>Other Cost:</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(otherCosts)/12)}</TableCell><TableCell className="text-right">{formatCurrency(parseFloat(otherCosts))}</TableCell></TableRow>
                                            <TableRow className="font-bold"><TableCell>Cash Flow:</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.cashFlow/12)}</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.cashFlow)}</TableCell></TableRow>
                                            <TableRow className="font-bold"><TableCell>Net Operating Income (NOI):</TableCell><TableCell className="text-right">{formatCurrency((results.firstYear.annualIncome - results.firstYear.expenses)/12)}</TableCell><TableCell className="text-right">{formatCurrency(results.firstYear.annualIncome - results.firstYear.expenses)}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="font-semibold mb-2">First Year Expense Breakdown</h3>
                                     <ChartContainer config={expenseChartConfig} className="min-h-[300px] w-full max-w-sm">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                            <Pie data={expenseBreakdownChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                                             label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                            {expenseBreakdownChartData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.fill} />
                                            ))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Breakdown Over Time</CardTitle>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Annual Income</TableHead>
                                            <TableHead>Mortgage</TableHead>
                                            <TableHead>Expenses</TableHead>
                                            <TableHead>Cash Flow</TableHead>
                                            <TableHead>Cash on Cash</TableHead>
                                            <TableHead>Equity</TableHead>
                                            <TableHead>If Sold (Cash)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="font-semibold bg-muted/50">
                                            <TableCell>Begin</TableCell>
                                            <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                                            <TableCell>{formatCurrency(-results.initialCashInvestment)}</TableCell>
                                            <TableCell></TableCell><TableCell></TableCell><TableCell></TableCell>
                                        </TableRow>
                                        {yearByYearData.map(d => (
                                            <TableRow key={d.year}>
                                                <TableCell>{d.year}</TableCell>
                                                <TableCell>{formatCurrency(d.annualIncome)}</TableCell>
                                                <TableCell>{formatCurrency(d.mortgage)}</TableCell>
                                                <TableCell>{formatCurrency(d.expenses)}</TableCell>
                                                <TableCell>{formatCurrency(d.cashFlow)}</TableCell>
                                                <TableCell>{d.cashOnCashReturn.toFixed(2)}%</TableCell>
                                                <TableCell>{formatCurrency(d.equityAccumulated)}</TableCell>
                                                <TableCell>{formatCurrency(d.ifSoldCash)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                )}
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>What is Net Operating Income (NOI)?</AccordionTrigger>
                                <AccordionContent>
                                Net Operating Income is the total income generated by a property after deducting all operating expenses. It does not include mortgage payments (debt service) or taxes. It's a key metric for assessing a property's profitability before financing. Formula: NOI = Gross Income - Operating Expenses.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>What is Cash Flow?</AccordionTrigger>
                                <AccordionContent>
                                Cash flow is the net amount of cash moving into and out of the investment. In this calculator, it's the Net Operating Income (NOI) minus any mortgage payments. A positive cash flow means you have money left over after paying all expenses and the mortgage.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>What is a Capitalization (Cap) Rate?</AccordionTrigger>
                                <AccordionContent>
                                The Cap Rate is a measure of the rate of return on a real estate investment based on the income that the property is expected to generate. It is calculated by dividing the Net Operating Income (NOI) by the property's purchase price. A higher cap rate generally indicates a better return, but also potentially higher risk.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>What is Cash on Cash Return?</AccordionTrigger>
                                <AccordionContent>
                                Cash on Cash Return measures the annual cash flow you receive relative to the amount of initial cash you invested. It's a powerful metric because it tells you the return on your actual out-of-pocket money. Formula: (Annual Cash Flow / Total Cash Invested) * 100.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger>Why is vacancy rate important?</AccordionTrigger>
                                <AccordionContent>
                                It's unrealistic to assume a rental property will be occupied 100% of the time. The vacancy rate accounts for periods when the property is empty between tenants, ensuring a more conservative and realistic projection of your rental income.
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
