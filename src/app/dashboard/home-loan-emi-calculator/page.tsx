'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Pie, PieChart, Cell, Tooltip as RechartsTooltip, Legend, Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
};

interface AmortizationYear {
    year: number;
    principal: number;
    interest: number;
    prepayments: number;
    taxesAndMaintenance: number;
    totalPayment: number;
    balance: number;
    loanPaidToDate: number;
}


export default function HomeLoanEmiCalculatorPage() {
    const [homeValue, setHomeValue] = useState(5000000);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [loanInsurance, setLoanInsurance] = useState(0);
    const [interestRate, setInterestRate] = useState(9);
    const [tenure, setTenure] = useState(20);
    const [loanFeesPercent, setLoanFeesPercent] = useState(0.25);
    const [oneTimeExpensesPercent, setOneTimeExpensesPercent] = useState(10);
    const [propertyTaxesPercent, setPropertyTaxesPercent] = useState(0.25);
    const [homeInsurancePercent, setHomeInsurancePercent] = useState(0.05);
    const [maintenanceExpenses, setMaintenanceExpenses] = useState(2500);
    const [monthlyExtraPayment, setMonthlyExtraPayment] = useState(0);
    
    const [results, setResults] = useState({
        emi: 0,
        totalMonthlyPayment: 0,
        totalInterest: 0,
        totalPayments: 0,
        totalPrepayments: 0,
        downPaymentAndFees: 0,
        taxesAndInsurance: 0
    });
    const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationYear[]>([]);
    
    const downPaymentAmount = useMemo(() => homeValue * (downPaymentPercent / 100), [homeValue, downPaymentPercent]);
    const loanAmount = useMemo(() => homeValue + loanInsurance - downPaymentAmount, [homeValue, loanInsurance, downPaymentAmount]);

    useEffect(() => {
        const p = loanAmount;
        const r = interestRate / 12 / 100;
        const n = tenure * 12;

        if (p <= 0 || r < 0 || n <= 0) {
            setResults({ emi: 0, totalMonthlyPayment: 0, totalInterest: 0, totalPrepayments: 0, totalPayments: 0, downPaymentAndFees: 0, taxesAndInsurance: 0 });
            setAmortizationSchedule([]);
            return;
        }

        const emi = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
        
        let balance = p;
        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0;
        let totalPrepaymentPaid = 0;
        
        const yearlyData: {[key: number]: Omit<AmortizationYear, 'year' | 'balance' | 'loanPaidToDate'>} = {};

        const propertyTaxesMonthly = (homeValue * (propertyTaxesPercent / 100)) / 12;
        const homeInsuranceMonthly = (homeValue * (homeInsurancePercent / 100)) / 12;
        const totalMonthlyTaxesAndMaintenance = propertyTaxesMonthly + homeInsuranceMonthly + maintenanceExpenses;


        for (let month = 1; month <= n && balance > 0; month++) {
            const interestForMonth = balance * r;
            let principalForMonth = emi - interestForMonth;
            
            const extraPaymentForMonth = Math.min(monthlyExtraPayment, balance - principalForMonth);
            
            if (balance < emi + extraPaymentForMonth) {
                principalForMonth = balance - interestForMonth - extraPaymentForMonth;
            }

            if (balance <= (principalForMonth + extraPaymentForMonth)) {
                principalForMonth = Math.min(principalForMonth, balance);
                const finalExtra = Math.max(0, balance - principalForMonth);
                balance = 0;
                totalPrepaymentPaid += finalExtra;
            } else {
                balance -= (principalForMonth + extraPaymentForMonth);
                totalPrepaymentPaid += extraPaymentForMonth;
            }


            totalInterestPaid += interestForMonth;
            totalPrincipalPaid += principalForMonth;
            
            const year = Math.ceil(month / 12);
            if (!yearlyData[year]) {
                yearlyData[year] = { principal: 0, interest: 0, prepayments: 0, taxesAndMaintenance: 0, totalPayment: 0 };
            }

            yearlyData[year].principal += principalForMonth;
            yearlyData[year].interest += interestForMonth;
            yearlyData[year].prepayments += extraPaymentForMonth;
            yearlyData[year].taxesAndMaintenance += totalMonthlyTaxesAndMaintenance;
            yearlyData[year].totalPayment += principalForMonth + interestForMonth + extraPaymentForMonth + totalMonthlyTaxesAndMaintenance;
        }

        let cumulativePrincipal = 0;
        const schedule = Object.keys(yearlyData).map(yearStr => {
            const year = parseInt(yearStr);
            const data = yearlyData[year];
            cumulativePrincipal += data.principal + data.prepayments;

            // Find the last balance for the year
            const monthsInYear = Math.min(12, n - (year-1)*12);
            let yearlyBalance = p;
            for(let i=0; i< (year-1)*12 + monthsInYear; i++) {
                const interest = yearlyBalance * r;
                let principal = emi - interest;
                const prepayment = monthlyExtraPayment;
                if(yearlyBalance < (principal + prepayment)) {
                   yearlyBalance = 0;
                } else {
                   yearlyBalance -= (principal + prepayment);
                }
            }


            return {
                year,
                ...data,
                balance: yearlyData[year-1] ? yearlyData[year-1].balance - (data.principal + data.prepayments + data.interest) : p - (data.principal + data.prepayments),
                loanPaidToDate: (cumulativePrincipal / p) * 100
            }
        });
        
        // This is a simplified balance calculation for the table display; more accurate would be month-by-month tracking.
        let runningBalance = p;
        const finalSchedule = schedule.map(s => {
            runningBalance -= (s.principal + s.prepayments);
            return {...s, balance: Math.max(0, runningBalance)};
        });


        setAmortizationSchedule(finalSchedule);

        const loanFees = loanAmount * (loanFeesPercent / 100);
        const oneTimeExpenses = homeValue * (oneTimeExpensesPercent / 100);
        
        const totalMonthlyPayment = emi + monthlyExtraPayment + totalMonthlyTaxesAndMaintenance;
        
        const downPaymentAndFees = downPaymentAmount + loanFees + oneTimeExpenses;
        const taxesAndInsuranceTotal = totalMonthlyTaxesAndMaintenance * n;
        const totalPayments = downPaymentAndFees + p + totalInterestPaid + taxesAndInsuranceTotal;


        setResults({
            emi,
            totalMonthlyPayment,
            totalInterest: totalInterestPaid,
            totalPrepayments: totalPrepaymentPaid,
            totalPayments,
            downPaymentAndFees,
            taxesAndInsurance: taxesAndInsuranceTotal
        });

    }, [homeValue, downPaymentPercent, loanInsurance, interestRate, tenure, loanFeesPercent, oneTimeExpensesPercent, propertyTaxesPercent, homeInsurancePercent, maintenanceExpenses, monthlyExtraPayment, loanAmount]);

    const pieData = useMemo(() => [
        { name: 'Principal', value: loanAmount, fill: 'hsl(var(--chart-2))' },
        { name: 'Interest', value: results.totalInterest, fill: 'hsl(var(--chart-1))' },
        { name: 'Taxes, Insurance & Maintenance', value: results.taxesAndInsurance, fill: 'hsl(var(--chart-3))' }
    ], [loanAmount, results.totalInterest, results.taxesAndInsurance]);

    const breakdownData = useMemo(() => [
        { name: 'Down Payment, Fees & One-time Expenses', value: results.downPaymentAndFees, fill: 'hsl(var(--chart-4))' },
        { name: 'Principal', value: loanAmount, fill: 'hsl(var(--chart-2))' },
        { name: 'Prepayments', value: results.totalPrepayments, fill: 'hsl(var(--chart-5))' },
        { name: 'Interest', value: results.totalInterest, fill: 'hsl(var(--chart-1))' },
        { name: 'Taxes, Home Insurance & Maintenance', value: results.taxesAndInsurance, fill: 'hsl(var(--chart-3))' }
    ], [results, loanAmount]);
    
    const chartConfig = {
        principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
        interest: { label: 'Interest', color: 'hsl(var(--chart-1))' },
        prepayments: { label: 'Prepayments', color: 'hsl(var(--chart-5))' },
        taxesAndMaintenance: { label: 'Taxes, Insurance & Maintenance', color: 'hsl(var(--chart-3))' },
        balance: { label: 'Balance', color: 'hsl(var(--chart-4))' }
    };
    
    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Home Loan Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Home Loan Calculator</CardTitle>
                            <CardDescription>A comprehensive calculator for your home loan and other expenses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-6 lg:col-span-2">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="home-value">Home Value (₹)</Label>
                                            <Input id="home-value" type="number" value={homeValue} onChange={(e) => setHomeValue(Number(e.target.value))} />
                                            <Slider value={[homeValue]} onValueChange={([val]) => setHomeValue(val)} min={1000000} max={50000000} step={100000} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="down-payment">Down Payment (%)</Label>
                                            <Input id="down-payment" type="number" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Number(e.target.value))} />
                                            <Slider value={[downPaymentPercent]} onValueChange={([val]) => setDownPaymentPercent(val)} min={10} max={50} step={1} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="loan-insurance">Loan Insurance (₹)</Label>
                                            <Input id="loan-insurance" type="number" value={loanInsurance} onChange={(e) => setLoanInsurance(Number(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                                            <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.1" />
                                            <Slider value={[interestRate]} onValueChange={([val]) => setInterestRate(val)} min={5} max={15} step={0.1} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="tenure">Loan Tenure (Years)</Label>
                                            <Input id="tenure" type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
                                            <Slider value={[tenure]} onValueChange={([val]) => setTenure(val)} min={5} max={30} step={1} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="loan-fees">Loan Fees & Charges (%)</Label>
                                            <Input id="loan-fees" type="number" value={loanFeesPercent} onChange={(e) => setLoanFeesPercent(Number(e.target.value))} step="0.01" />
                                        </div>
                                    </div>
                                    <Card>
                                        <CardHeader><CardTitle className="text-lg">Homeowner Expenses</CardTitle></CardHeader>
                                        <CardContent className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label>One-time Expenses (%)</Label>
                                                <Input type="number" value={oneTimeExpensesPercent} onChange={e => setOneTimeExpensesPercent(Number(e.target.value))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Property Taxes / year (%)</Label>
                                                <Input type="number" value={propertyTaxesPercent} onChange={e => setPropertyTaxesPercent(Number(e.target.value))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Home Insurance / year (%)</Label>
                                                <Input type="number" value={homeInsurancePercent} onChange={e => setHomeInsurancePercent(Number(e.target.value))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Maintenance / month (₹)</Label>
                                                <Input type="number" value={maintenanceExpenses} onChange={e => setMaintenanceExpenses(Number(e.target.value))} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Monthly Extra Payment (₹)</Label>
                                                <Input type="number" value={monthlyExtraPayment} onChange={e => setMonthlyExtraPayment(Number(e.target.value))} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-6">
                                    <Card className="bg-muted/50">
                                        <CardHeader>
                                            <CardTitle className="text-xl">Loan Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Home Value:</span> <span className="font-semibold">{formatCurrency(homeValue)}</span></div>
                                            <div className="flex justify-between"><span>Down Payment:</span> <span className="font-semibold">{formatCurrency(downPaymentAmount)}</span></div>
                                            <div className="flex justify-between"><span>Loan Insurance:</span> <span className="font-semibold">{formatCurrency(loanInsurance)}</span></div>
                                            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Loan Amount:</span> <span className="font-bold text-primary">{formatCurrency(loanAmount)}</span></div>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Monthly Payment</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Principal & Interest (EMI):</span> <span className="font-semibold">{formatCurrency(results.emi)}</span></div>
                                            <div className="flex justify-between"><span>Monthly Extra Payment:</span> <span className="font-semibold">{formatCurrency(monthlyExtraPayment)}</span></div>
                                            <div className="flex justify-between"><span>Property Taxes:</span> <span className="font-semibold">{formatCurrency((homeValue * (propertyTaxesPercent / 100)) / 12)}</span></div>
                                            <div className="flex justify-between"><span>Home Insurance:</span> <span className="font-semibold">{formatCurrency((homeValue * (homeInsurancePercent / 100)) / 12)}</span></div>
                                            <div className="flex justify-between"><span>Maintenance Expenses:</span> <span className="font-semibold">{formatCurrency(maintenanceExpenses)}</span></div>
                                             <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total Monthly Payment:</span> <span className="font-bold text-primary">{formatCurrency(results.totalMonthlyPayment)}</span></div>
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader>
                                            <CardTitle className="text-xl">Total of all Payments</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Down Payment, Fees, etc:</span> <span className="font-semibold">{formatCurrency(results.downPaymentAndFees)}</span></div>
                                            <div className="flex justify-between"><span>Principal:</span> <span className="font-semibold">{formatCurrency(loanAmount)}</span></div>
                                            <div className="flex justify-between"><span>Prepayments:</span> <span className="font-semibold">{formatCurrency(results.totalPrepayments)}</span></div>
                                            <div className="flex justify-between"><span>Interest:</span> <span className="font-semibold">{formatCurrency(results.totalInterest)}</span></div>
                                            <div className="flex justify-between"><span>Taxes, Insurance, etc:</span> <span className="font-semibold">{formatCurrency(results.taxesAndInsurance)}</span></div>
                                            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total:</span> <span className="font-bold text-primary">{formatCurrency(results.totalPayments + results.totalPrepayments)}</span></div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Payment Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className="text-center font-semibold mb-4">Loan Payment (Principal, Interest & Taxes)</h3>
                                    <ChartContainer config={chartConfig} className="min-h-[250px]">
                                        <PieChart>
                                            <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} label>
                                                 {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                                <div>
                                    <h3 className="text-center font-semibold mb-4">Total Payments Breakdown</h3>
                                    <ChartContainer config={{
                                         'Down Payment, Fees & One-time Expenses': { label: 'Down Payment, Fees & One-time Expenses', color: 'hsl(var(--chart-4))'},
                                         'Principal': { label: 'Principal', color: 'hsl(var(--chart-2))' },
                                         'Prepayments': { label: 'Prepayments', color: 'hsl(var(--chart-5))' },
                                         'Interest': { label: 'Interest', color: 'hsl(var(--chart-1))' },
                                         'Taxes, Home Insurance & Maintenance': { label: 'Taxes, Home Insurance & Maintenance', color: 'hsl(var(--chart-3))' }
                                    }} className="min-h-[250px]">
                                        <PieChart>
                                            <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Pie data={breakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                 {breakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                            </Pie>
                                            <Legend />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {amortizationSchedule.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Home Loan Payment Schedule</CardTitle>
                                <CardDescription>Yearly breakdown of your loan repayment.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                                     <AreaChart
                                        accessibilityLayer
                                        data={amortizationSchedule}
                                        margin={{ left: 12, right: 12, top: 20 }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="year"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => `Year ${value}`}
                                        />
                                        <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Area dataKey="principal" type="natural" fill="var(--color-principal)" fillOpacity={0.7} stroke="var(--color-principal)" stackId="a" name="Principal" />
                                        <Area dataKey="interest" type="natural" fill="var(--color-interest)" fillOpacity={0.7} stroke="var(--color-interest)" stackId="a" name="Interest" />
                                        <Area dataKey="prepayments" type="natural" fill="var(--color-prepayments)" fillOpacity={0.7} stroke="var(--color-prepayments)" stackId="a" name="Prepayments" />
                                        <Area dataKey="taxesAndMaintenance" type="natural" fill="var(--color-taxesAndMaintenance)" fillOpacity={0.7} stroke="var(--color-taxesAndMaintenance)" stackId="a" name="Taxes, Insurance & Maintenance" />
                                    </AreaChart>
                                </ChartContainer>

                                <div className="mt-8">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Year</TableHead>
                                                <TableHead>Principal (A)</TableHead>
                                                <TableHead>Interest (B)</TableHead>
                                                <TableHead>Taxes, Home Insurance & Maintenance (C)</TableHead>
                                                <TableHead>Total Payment (A + B + C)</TableHead>
                                                <TableHead>Balance</TableHead>
                                                <TableHead className="text-right">Loan Paid To Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {amortizationSchedule.map((row) => (
                                                <TableRow key={row.year}>
                                                    <TableCell>{row.year}</TableCell>
                                                    <TableCell>{formatCurrency(row.principal)}</TableCell>
                                                    <TableCell>{formatCurrency(row.interest)}</TableCell>
                                                    <TableCell>{formatCurrency(row.taxesAndMaintenance)}</TableCell>
                                                    <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
                                                    <TableCell>{formatCurrency(row.balance)}</TableCell>
                                                    <TableCell className="text-right">{row.loanPaidToDate.toFixed(2)}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </>
    );
}
