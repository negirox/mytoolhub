
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Slider } from '@/components/ui/slider';
import {
  Pie,
  PieChart,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Line,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Currency = 'INR' | 'USD' | 'EUR';

const currencyLocales: Record<Currency, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
};
const currencySymbols: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

interface MonthlyAmortizationData {
  month: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  balance: number;
}

interface AmortizationYear {
  year: number;
  principal: number;
  interest: number;
  prepayments: number;
  taxesAndMaintenance: number;
  totalPayment: number;
  balance: number;
  loanPaidToDate: number;
  monthlyData: MonthlyAmortizationData[];
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
  const [currency, setCurrency] = useState<Currency>('INR');

  const [results, setResults] = useState({
    emi: 0,
    totalMonthlyPayment: 0,
    totalInterest: 0,
    totalPayments: 0,
    totalPrepayments: 0,
    downPaymentAndFees: 0,
    taxesAndInsurance: 0,
  });
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationYear[]
  >([]);

  const downPaymentAmount = useMemo(
    () => homeValue * (downPaymentPercent / 100),
    [homeValue, downPaymentPercent]
  );
  const loanAmount = useMemo(
    () => homeValue + loanInsurance - downPaymentAmount,
    [homeValue, loanInsurance, downPaymentAmount]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };


  useEffect(() => {
    const p = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;

    if (p <= 0 || r < 0 || n <= 0) {
      setResults({
        emi: 0,
        totalMonthlyPayment: 0,
        totalInterest: 0,
        totalPrepayments: 0,
        totalPayments: 0,
        downPaymentAndFees: 0,
        taxesAndInsurance: 0,
      });
      setAmortizationSchedule([]);
      return;
    }

    const emi =
      r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;

    let balance = p;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    let totalPrepaymentPaid = 0;

    const yearlyData: {
      [key: number]: Omit<
        AmortizationYear,
        'year' | 'balance' | 'loanPaidToDate' | 'monthlyData'
      > & { monthlyData: MonthlyAmortizationData[] };
    } = {};

    const propertyTaxesMonthly = (homeValue * (propertyTaxesPercent / 100)) / 12;
    const homeInsuranceMonthly =
      (homeValue * (homeInsurancePercent / 100)) / 12;
    const totalMonthlyTaxesAndMaintenance =
      propertyTaxesMonthly + homeInsuranceMonthly + maintenanceExpenses;

    for (let month = 1; month <= n && balance > 0; month++) {
      const interestForMonth = balance * r;
      let principalForMonth = emi - interestForMonth;
      let extraPaymentForMonth = 0;
      let currentMonthPayment = emi;

      if (monthlyExtraPayment > 0) {
        extraPaymentForMonth = Math.min(
          monthlyExtraPayment,
          balance - principalForMonth
        );
        currentMonthPayment += extraPaymentForMonth;
      }
      
      if (balance <= principalForMonth + extraPaymentForMonth) {
        extraPaymentForMonth = Math.max(0, balance - principalForMonth);
        principalForMonth = Math.min(principalForMonth, balance);
        currentMonthPayment =
          principalForMonth + interestForMonth + extraPaymentForMonth;
        balance = 0;
      } else {
        balance -= principalForMonth + extraPaymentForMonth;
      }

      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += principalForMonth;
      totalPrepaymentPaid += extraPaymentForMonth;

      const year = Math.ceil(month / 12);
      if (!yearlyData[year]) {
        yearlyData[year] = {
          principal: 0,
          interest: 0,
          prepayments: 0,
          taxesAndMaintenance: 0,
          totalPayment: 0,
          monthlyData: [],
        };
      }

      yearlyData[year].principal += principalForMonth;
      yearlyData[year].interest += interestForMonth;
      yearlyData[year].prepayments += extraPaymentForMonth;
      yearlyData[year].taxesAndMaintenance += totalMonthlyTaxesAndMaintenance;
      yearlyData[year].totalPayment +=
        principalForMonth +
        interestForMonth +
        extraPaymentForMonth +
        totalMonthlyTaxesAndMaintenance;
      yearlyData[year].monthlyData.push({
        month: month,
        principal: principalForMonth,
        interest: interestForMonth,
        extraPayment: extraPaymentForMonth,
        totalPayment: currentMonthPayment + totalMonthlyTaxesAndMaintenance,
        balance: balance,
      });
    }

    let cumulativePrincipal = 0;
    const schedule = Object.keys(yearlyData).map((yearStr) => {
      const year = parseInt(yearStr);
      const data = yearlyData[year];
      cumulativePrincipal += data.principal + data.prepayments;

      return {
        year,
        ...data,
        balance: data.monthlyData[data.monthlyData.length - 1].balance,
        loanPaidToDate: (cumulativePrincipal / p) * 100,
      };
    });

    setAmortizationSchedule(schedule);

    const loanFees = loanAmount * (loanFeesPercent / 100);
    const oneTimeExpenses = homeValue * (oneTimeExpensesPercent / 100);

    const totalMonthlyPayment = emi + monthlyExtraPayment + totalMonthlyTaxesAndMaintenance;

    const downPaymentAndFees = downPaymentAmount + loanFees + oneTimeExpenses;
    const taxesAndInsuranceTotal = totalMonthlyTaxesAndMaintenance * n;
    const totalPayments =
      downPaymentAndFees + p + totalInterestPaid + taxesAndInsuranceTotal;

    setResults({
      emi,
      totalMonthlyPayment,
      totalInterest: totalInterestPaid,
      totalPrepayments: totalPrepaymentPaid,
      totalPayments,
      downPaymentAndFees,
      taxesAndInsurance: taxesAndInsuranceTotal,
    });
  }, [
    homeValue,
    downPaymentPercent,
    loanInsurance,
    interestRate,
    tenure,
    loanFeesPercent,
    oneTimeExpensesPercent,
    propertyTaxesPercent,
    homeInsurancePercent,
    maintenanceExpenses,
    monthlyExtraPayment,
    loanAmount,
    currency,
  ]);
  
  const AmortizationRow = ({ row }: { row: AmortizationYear }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <>
        <TableRow className="bg-muted/50 hover:bg-muted">
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
           <TableCell>{formatCurrency(row.prepayments)}</TableCell>
          <TableCell>{formatCurrency(row.taxesAndMaintenance)}</TableCell>
          <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
          <TableCell>{formatCurrency(row.balance)}</TableCell>
          <TableCell className="text-right">
            {row.loanPaidToDate.toFixed(2)}%
          </TableCell>
        </TableRow>
        <Collapsible open={isOpen} asChild>
          <CollapsibleContent asChild>
            <tr className="bg-background">
              <TableCell colSpan={8} className="p-0">
                <div className="p-4 overflow-x-auto">
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

  const chartConfig = useMemo(
    () => ({
      principal: {
        label: 'Principal',
        color: 'hsl(var(--chart-2))',
      },
      interest: {
        label: 'Interest',
        color: 'hsl(var(--chart-1))',
      },
      prepayments: {
        label: 'Prepayments',
        color: 'hsl(var(--chart-5))',
      },
      taxesAndMaintenance: {
        label: 'Taxes, Insurance & Maintenance',
        color: 'hsl(var(--chart-3))',
      },
      balance: {
        label: 'Balance',
        color: 'hsl(var(--chart-4))',
      },
      downPaymentAndFees: {
        label: 'Down Payment, Fees & One-time Expenses',
        color: 'hsl(var(--chart-6))',
      },
    }),
    []
  );

  const pieData = useMemo(
    () => [
      {
        name: 'Principal',
        value: loanAmount,
        fill: 'var(--color-principal)',
      },
      {
        name: 'Interest',
        value: results.totalInterest,
        fill: 'var(--color-interest)',
      },
      {
        name: 'Taxes, Insurance & Maintenance',
        value: results.taxesAndInsurance,
        fill: 'var(--color-taxesAndMaintenance)',
      },
    ],
    [loanAmount, results.totalInterest, results.taxesAndInsurance]
  );

  const breakdownData = useMemo(
    () => [
      {
        name: 'Down Payment, Fees & One-time Expenses',
        value: results.downPaymentAndFees,
        fill: 'var(--color-downPaymentAndFees)',
      },
      { name: 'Principal', value: loanAmount, fill: 'var(--color-principal)' },
      {
        name: 'Prepayments',
        value: results.totalPrepayments,
        fill: 'var(--color-prepayments)',
      },
      {
        name: 'Interest',
        value: results.totalInterest,
        fill: 'var(--color-interest)',
      },
      {
        name: 'Taxes, Home Insurance & Maintenance',
        value: results.taxesAndInsurance,
        fill: 'var(--color-taxesAndMaintenance)',
      },
    ],
    [results, loanAmount]
  );

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">
          Home Loan Calculator
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Home Loan Calculator
              </CardTitle>
              <CardDescription>
                A comprehensive calculator for your home loan and other expenses.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="mb-6 max-w-xs">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
                    <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="home-value">Home Value ({currencySymbols[currency]})</Label>
                      <Input
                        id="home-value"
                        type="number"
                        value={homeValue}
                        onChange={(e) => setHomeValue(Number(e.target.value))}
                      />
                      <Slider
                        value={[homeValue]}
                        onValueChange={([val]) => setHomeValue(val)}
                        min={1000000}
                        max={50000000}
                        step={100000}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="down-payment">Down Payment (%)</Label>
                      <Input
                        id="down-payment"
                        type="number"
                        value={downPaymentPercent}
                        onChange={(e) =>
                          setDownPaymentPercent(Number(e.target.value))
                        }
                      />
                      <Slider
                        value={[downPaymentPercent]}
                        onValueChange={([val]) => setDownPaymentPercent(val)}
                        min={10}
                        max={50}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-insurance">
                        Loan Insurance ({currencySymbols[currency]})
                      </Label>
                      <Input
                        id="loan-insurance"
                        type="number"
                        value={loanInsurance}
                        onChange={(e) =>
                          setLoanInsurance(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                      <Input
                        id="interest-rate"
                        type="number"
                        value={interestRate}
                        onChange={(e) =>
                          setInterestRate(Number(e.target.value))
                        }
                        step="0.1"
                      />
                      <Slider
                        value={[interestRate]}
                        onValueChange={([val]) => setInterestRate(val)}
                        min={5}
                        max={15}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenure">Loan Tenure (Years)</Label>
                      <Input
                        id="tenure"
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                      />
                      <Slider
                        value={[tenure]}
                        onValueChange={([val]) => setTenure(val)}
                        min={5}
                        max={30}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-fees">
                        Loan Fees & Charges (%)
                      </Label>
                      <Input
                        id="loan-fees"
                        type="number"
                        value={loanFeesPercent}
                        onChange={(e) =>
                          setLoanFeesPercent(Number(e.target.value))
                        }
                        step="0.01"
                      />
                    </div>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Homeowner Expenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>One-time Expenses (%)</Label>
                        <Input
                          type="number"
                          value={oneTimeExpensesPercent}
                          onChange={(e) =>
                            setOneTimeExpensesPercent(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Property Taxes / year (%)</Label>
                        <Input
                          type="number"
                          value={propertyTaxesPercent}
                          onChange={(e) =>
                            setPropertyTaxesPercent(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Home Insurance / year (%)</Label>
                        <Input
                          type="number"
                          value={homeInsurancePercent}
                          onChange={(e) =>
                            setHomeInsurancePercent(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maintenance / month ({currencySymbols[currency]})</Label>
                        <Input
                          type="number"
                          value={maintenanceExpenses}
                          onChange={(e) =>
                            setMaintenanceExpenses(Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Extra Payment ({currencySymbols[currency]})</Label>
                        <Input
                          type="number"
                          value={monthlyExtraPayment}
                          onChange={(e) =>
                            setMonthlyExtraPayment(Number(e.target.value))
                          }
                        />
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
                      <div className="flex justify-between">
                        <span>Home Value:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(homeValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Down Payment:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(downPaymentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Insurance:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(loanInsurance)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-base font-bold">
                        <span>Loan Amount:</span>{' '}
                        <span className="font-bold text-primary">
                          {formatCurrency(loanAmount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Monthly Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Principal & Interest (EMI):</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(results.emi)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Extra Payment:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(monthlyExtraPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Taxes:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(
                            (homeValue * (propertyTaxesPercent / 100)) / 12
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Home Insurance:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(
                            (homeValue * (homeInsurancePercent / 100)) / 12
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maintenance Expenses:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(maintenanceExpenses)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-base font-bold">
                        <span>Total Monthly Payment:</span>{' '}
                        <span className="font-bold text-primary">
                          {formatCurrency(results.totalMonthlyPayment)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Total of all Payments
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Down Payment, Fees, etc:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(results.downPaymentAndFees)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Principal:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(loanAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prepayments:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(results.totalPrepayments)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(results.totalInterest)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes, Insurance, etc:</span>{' '}
                        <span className="font-semibold">
                          {formatCurrency(results.taxesAndInsurance)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-base font-bold">
                        <span>Total:</span>{' '}
                        <span className="font-bold text-primary">
                          {formatCurrency(
                            results.totalPayments + results.totalPrepayments
                          )}
                        </span>
                      </div>
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
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-center font-semibold">
                    Loan Payment (Principal, Interest & Taxes)
                  </h3>
                  <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-sm mx-auto">
                    <PieChart>
                      <RechartsTooltip
                        content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)}/>}
                      />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                      />
                    </PieChart>
                  </ChartContainer>
                </div>
                <div>
                  <h3 className="mb-4 text-center font-semibold">
                    Total Payments Breakdown
                  </h3>
                  <ChartContainer
                    config={{
                      ...chartConfig,
                      'Down Payment, Fees & One-time Expenses':
                        chartConfig.downPaymentAndFees,
                      'Taxes, Home Insurance & Maintenance':
                        chartConfig.taxesAndMaintenance,
                    }}
                    className="min-h-[250px] w-full max-w-sm mx-auto"
                  >
                    <PieChart>
                      <RechartsTooltip
                        content={<ChartTooltipContent nameKey="name" formatter={(value) => formatCurrency(value as number)}/>}
                      />
                      <Pie
                        data={breakdownData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
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
                <CardTitle className="font-headline">
                  Balance and Interest Paid by Year
                </CardTitle>
                <CardDescription>
                  Yearly breakdown of your loan repayment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="min-h-[400px] w-full"
                >
                  <BarChart
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
                     <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => formatCurrency(value as number)}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => formatCurrency(value as number)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" formatter={(value, name) => <span>{formatCurrency(value as number)}</span>} />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="balance" fill="var(--color-balance)" yAxisId="left" name="Balance" radius={4} />
                    <Line type="monotone" dataKey="interest" stroke="var(--color-interest)" yAxisId="right" name="Interest Paid" strokeWidth={2} dot={false} />
                  </BarChart>
                </ChartContainer>

                <div className="mt-8 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead>Principal (A)</TableHead>
                        <TableHead>Interest (B)</TableHead>
                        <TableHead>Prepayments</TableHead>
                        <TableHead>
                          Taxes, Home Insurance & Maintenance (C)
                        </TableHead>
                        <TableHead>Total Payment (A + B + C)</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">
                          Loan Paid To Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {amortizationSchedule.map((row) => (
                        <AmortizationRow key={row.year} row={row} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Frequently Asked Questions (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                  <AccordionTrigger>
                    What is the difference between an EMI and a Home Loan EMI?
                  </AccordionTrigger>
                  <AccordionContent>
                    While a standard EMI (Equated Monthly Installment) only
                    covers the principal and interest of your loan, a Home
                    Loan EMI is often part of a larger total monthly payment
                    that can include other costs like property taxes, home
                    insurance, and maintenance fees. This calculator helps you
                    see the complete picture.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                  <AccordionTrigger>How does the down payment affect my loan?</AccordionTrigger>
                  <AccordionContent>
                    A larger down payment reduces your total loan amount,
                    which in turn lowers your monthly EMI and the total
                    interest you'll pay over the loan's lifetime. It can also
                    help you secure a better interest rate from the lender.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                  <AccordionTrigger>
                    What are one-time expenses and why should I consider them?
                  </AccordionTrigger>
                  <AccordionContent>
                    One-time expenses include costs like registration fees,
                    stamp duty, legal fees, and brokerage that you pay when
                    purchasing a home. Factoring these into your budget is
                    crucial for understanding the true initial cost of buying
                    your property. This calculator accounts for them as a
                    percentage of the home value.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                  <AccordionTrigger>
                    How do prepayments or extra payments help?
                  </AccordionTrigger>
                  <AccordionContent>
                    Making extra payments towards your loan principal helps
                    you pay off the loan faster and save a significant amount
                    on total interest. Even small, regular prepayments can
                    shorten your loan tenure by several years.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                  <AccordionTrigger>
                    Are property taxes and home insurance mandatory?
                  </AccordionTrigger>
                  <AccordionContent>
                    Property taxes are mandatory and paid to the local municipal authority. Home insurance is highly recommended and often required by lenders to protect the property against unforeseen damages like fire or natural disasters, ensuring the value of the asset is protected.
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
