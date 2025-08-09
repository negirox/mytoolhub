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
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type PrepaymentFrequency = 'none' | 'monthly' | 'yearly' | 'quarterly';
interface MonthlyAmortizationData {
  month: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  balance: number;
}
interface AmortizationData {
  year: number;
  principal: number; // yearly principal
  interest: number; // yearly interest
  totalPayment: number; // yearly total payment
  extraPayment: number; // yearly extra payment
  balance: number;
  loanPaidToDate: number;
  monthlyData: MonthlyAmortizationData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

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

    if (p <= 0 || r < 0 || n <= 0) {
      setEmi(null);
      setTotalInterest(null);
      setTotalPayment(null);
      setAmortizationData([]);
      return;
    }
    
    if (r === 0) {
        const emiValue = p / n;
        setEmi(emiValue);
        // ... handle zero interest rate amortization if needed
        return;
    }

    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(emiValue);

    let balance = p;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    
    const yearlyData: { [key: number]: Omit<AmortizationData, 'year' | 'balance' | 'loanPaidToDate'> & {monthlyData: MonthlyAmortizationData[]} } = {};

    let originalMonths = n;

    for (let month = 1; month <= originalMonths && balance > 0; month++) {
      const interestForMonth = balance * r;
      let principalForMonth = emiValue - interestForMonth;

      let extraPaymentForMonth = 0;
      if (prepaymentFrequency !== 'none' && extra > 0) {
        const freqMap = { monthly: 1, quarterly: 3, yearly: 12 };
        if (month % freqMap[prepaymentFrequency] === 0) {
          extraPaymentForMonth = Math.min(extra, balance - principalForMonth);
        }
      }
      
      let currentMonthPayment = emiValue + extraPaymentForMonth;
      if (balance < principalForMonth) {
        principalForMonth = balance;
        currentMonthPayment = balance + interestForMonth;
      }
      if (balance <= (principalForMonth + extraPaymentForMonth)) {
         extraPaymentForMonth = Math.max(0, balance - principalForMonth);
         principalForMonth = Math.min(principalForMonth, balance);
         currentMonthPayment = principalForMonth + interestForMonth + extraPaymentForMonth;
         balance = 0;
      } else {
         balance -= (principalForMonth + extraPaymentForMonth);
      }

      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += principalForMonth + extraPaymentForMonth;
      
      const year = Math.ceil(month / 12);
      if (!yearlyData[year]) {
        yearlyData[year] = {
          principal: 0,
          interest: 0,
          totalPayment: 0,
          extraPayment: 0,
          monthlyData: []
        };
      }
      yearlyData[year].principal += principalForMonth;
      yearlyData[year].interest += interestForMonth;
      yearlyData[year].totalPayment += currentMonthPayment;
      yearlyData[year].extraPayment += extraPaymentForMonth;
      yearlyData[year].monthlyData.push({
          month: month,
          principal: principalForMonth,
          interest: interestForMonth,
          extraPayment: extraPaymentForMonth,
          totalPayment: currentMonthPayment,
          balance: balance
      });
    }

    const schedule: AmortizationData[] = [];
    let cumulativePaid = 0;
    Object.keys(yearlyData).forEach((yearStr) => {
      const year = parseInt(yearStr);
      const data = yearlyData[year];
      cumulativePaid += data.principal + data.extraPayment;

      schedule.push({
        year: year,
        principal: data.principal,
        interest: data.interest,
        totalPayment: data.totalPayment,
        balance: data.monthlyData[data.monthlyData.length-1].balance,
        loanPaidToDate: (cumulativePaid / p) * 100,
        extraPayment: data.extraPayment,
        monthlyData: data.monthlyData,
      });
    });

    setTotalInterest(totalInterestPaid);
    setTotalPayment(p + totalInterestPaid);
    setAmortizationData(schedule);
  };

  useEffect(() => {
    calculateEmi();
  }, [principal, interestRate, tenure, prepaymentAmount, prepaymentFrequency]);
  
  const AmortizationRow = ({ row }: { row: AmortizationData }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <>
        <TableRow className="bg-muted/20">
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="size-6"
            >
              {isOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
            {row.year}
          </TableCell>
          <TableCell>{formatCurrency(row.principal)}</TableCell>
          <TableCell>{formatCurrency(row.interest)}</TableCell>
          <TableCell>{formatCurrency(row.extraPayment)}</TableCell>
          <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
          <TableCell>{formatCurrency(row.balance)}</TableCell>
          <TableCell className="text-right">
            {row.loanPaidToDate.toFixed(2)}%
          </TableCell>
        </TableRow>
        <Collapsible open={isOpen} asChild>
          <CollapsibleContent asChild>
            <tr className="bg-background">
              <TableCell colSpan={7} className="p-0">
                <div className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Extra Payment</TableHead>
                        <TableHead>Total Payment</TableHead>
                        <TableHead>Ending Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {row.monthlyData.map((monthData) => (
                        <TableRow key={monthData.month}>
                          <TableCell>{monthData.month}</TableCell>
                          <TableCell>
                            {formatCurrency(monthData.principal)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(monthData.interest)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(monthData.extraPayment)}
                          </TableCell>
                           <TableCell>
                            {formatCurrency(monthData.totalPayment)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(monthData.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TableCell>
            </tr>
          </CollapsibleContent>
        </Collapsible>
      </>
    );
  };

  const chartConfig = {
    principal: { label: 'Principal', color: 'hsl(var(--chart-2))' },
    interest: { label: 'Interest', color: 'hsl(var(--chart-1))' },
    extraPayment: { label: 'Extra Payment', color: 'hsl(var(--chart-3))' }
  };
  
  const pieChartData = useMemo(() => ([
    { name: 'Principal Amount', value: parseFloat(principal) || 0, fill: 'hsl(var(--chart-2))' },
    { name: 'Total Interest', value: totalInterest || 0, fill: 'hsl(var(--chart-1))' }
  ]), [principal, totalInterest]);


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
                <div className="space-y-4">
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
                      onValueChange={(value) =>
                        setInterestRate(String(value[0]))
                      }
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

                <div className="flex flex-col items-center justify-center gap-4">
                    {emi !== null && totalInterest !== null && totalPayment !== null && (
                        <div className="grid grid-cols-1 gap-4 text-center w-full">
                           <div className="space-y-1 rounded-lg border p-4">
                              <p className="text-sm font-medium text-muted-foreground">Monthly EMI</p>
                              <p className="text-2xl font-bold text-primary">{formatCurrency(emi)}</p>
                            </div>
                            <div className="space-y-1 rounded-lg border p-4">
                              <p className="text-sm font-medium text-muted-foreground">Total Interest</p>
                              <p className="text-2xl font-bold">{formatCurrency(totalInterest)}</p>
                            </div>
                            <div className="space-y-1 rounded-lg border p-4">
                              <p className="text-sm font-medium text-muted-foreground">Total Payment (Principal + Interest)</p>
                              <p className="text-2xl font-bold">{formatCurrency(totalPayment)}</p>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full mt-6">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Advanced Options (Prepayment)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="prepayment-freq">
                          Prepayment Frequency
                        </Label>
                        <Select
                          value={prepaymentFrequency}
                          onValueChange={(val) =>
                            setPrepaymentFrequency(val as PrepaymentFrequency)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">
                              Quarterly
                            </SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prepayment-amount">
                          Prepayment Amount (₹)
                        </Label>
                        <Input
                          id="prepayment-amount"
                          type="number"
                          value={prepaymentAmount}
                          onChange={(e) => setPrepaymentAmount(e.target.value)}
                          placeholder="e.g. 10000"
                          disabled={prepaymentFrequency === 'none'}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {amortizationData.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="font-headline">
                    Loan Amortization
                  </CardTitle>
                  <CardDescription>
                    Breakdown of your payments over the loan tenure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={chartConfig}
                    className="min-h-[300px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={amortizationData}
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
                      <YAxis
                        tickFormatter={(value) => formatCurrency(value)}
                        
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => (
                              <span style={{color: chartConfig[name as keyof typeof chartConfig]?.color}}>
                                {chartConfig[name as keyof typeof chartConfig]?.label}: {formatCurrency(value as number)}
                              </span>
                            )}
                          />
                        }
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        dataKey="principal"
                        type="natural"
                        fill="var(--color-principal)"
                        fillOpacity={0.7}
                        stroke="var(--color-principal)"
                        stackId="a"
                        name="Principal"
                      />
                      <Area
                        dataKey="interest"
                        type="natural"
                        fill="var(--color-interest)"
                        fillOpacity={0.7}
                        stroke="var(--color-interest)"
                        stackId="a"
                        name="Interest"
                      />
                       {prepaymentFrequency !== 'none' && parseFloat(prepaymentAmount) > 0 && (
                          <Area
                            dataKey="extraPayment"
                            type="natural"
                            fill="var(--color-extraPayment)"
                            fillOpacity={0.7}
                            stroke="var(--color-extraPayment)"
                            stackId="a"
                            name="Extra Payment"
                          />
                        )}
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                 <CardHeader>
                  <CardTitle className="font-headline">
                    Payment Breakdown
                  </CardTitle>
                  <CardDescription>
                    Principal vs. Interest
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                       <PieChart>
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Pie
                            data={pieChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
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
                          <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                           />
                       </PieChart>
                    </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}

           {amortizationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Amortization Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Year</TableHead>
                      <TableHead>Principal (A)</TableHead>
                      <TableHead>Interest (B)</TableHead>
                      <TableHead>Extra Payments</TableHead>
                      <TableHead>Total Payment (A + B + Extra)</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead className="text-right">Loan Paid To Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amortizationData.map((row) => (
                      <AmortizationRow key={row.year} row={row} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
           )}
        </div>
      </main>
    </>
  );
}
