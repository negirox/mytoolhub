
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthlyAmortizationData {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
}
interface AmortizationYear {
  year: number;
  principal: number;
  interest: number;
  totalPayment: number;
  balance: number;
  loanPaidToDate: number;
  monthlyData: MonthlyAmortizationData[];
}

type Currency = 'USD' | 'INR' | 'EUR';

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
};

const currencyLocales: Record<Currency, string> = {
    USD: 'en-US',
    INR: 'en-IN',
    EUR: 'de-DE', // Using German locale for Euro formatting
};

export default function AmortizationCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState('240000');
  const [interestRate, setInterestRate] = useState('7.0');
  const [loanTerm, setLoanTerm] = useState('30');
  const [currency, setCurrency] = useState<Currency>('USD');
  
  const [amortizationData, setAmortizationData] = useState<AmortizationYear[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currencyLocales[currency], {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateAmortization = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(loanTerm) * 12;

    if (p <= 0 || r <= 0 || n <= 0) {
      setAmortizationData([]);
      return;
    }

    const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    let balance = p;
    const yearlyData: { [key: number]: Omit<AmortizationYear, 'year' | 'balance' | 'loanPaidToDate'> & {monthlyData: MonthlyAmortizationData[]} } = {};

    for (let month = 1; month <= n; month++) {
      const interestForMonth = balance * r;
      let principalForMonth = emiValue - interestForMonth;
      
      if (balance <= principalForMonth) {
          principalForMonth = balance;
      }
      balance -= principalForMonth;

      const year = Math.ceil(month / 12);
      if (!yearlyData[year]) {
        yearlyData[year] = { principal: 0, interest: 0, totalPayment: 0, monthlyData: [] };
      }
      
      yearlyData[year].principal += principalForMonth;
      yearlyData[year].interest += interestForMonth;
      yearlyData[year].totalPayment += emiValue;
      yearlyData[year].monthlyData.push({
          month: month,
          principal: principalForMonth,
          interest: interestForMonth,
          totalPayment: emiValue,
          balance: balance
      });
    }

    let cumulativePaid = 0;
    const schedule: AmortizationYear[] = Object.keys(yearlyData).map((yearStr) => {
        const year = parseInt(yearStr);
        const data = yearlyData[year];
        cumulativePaid += data.principal;
        return {
            year,
            principal: data.principal,
            interest: data.interest,
            totalPayment: data.totalPayment,
            balance: data.monthlyData[data.monthlyData.length-1].balance,
            loanPaidToDate: (cumulativePaid / p) * 100,
            monthlyData: data.monthlyData,
        };
    });

    setAmortizationData(schedule);
  };
  
  useEffect(() => {
    calculateAmortization();
  }, [loanAmount, interestRate, loanTerm, currency]);

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
          <TableCell>{formatCurrency(row.totalPayment)}</TableCell>
          <TableCell>{formatCurrency(row.balance)}</TableCell>
          <TableCell className="text-right">
            {row.loanPaidToDate.toFixed(2)}%
          </TableCell>
        </TableRow>
        <Collapsible open={isOpen} asChild>
          <CollapsibleContent asChild>
            <tr className="bg-background">
              <TableCell colSpan={6} className="p-0">
                <div className="p-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
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


  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Amortization Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Loan Amortization Schedule
              </CardTitle>
              <CardDescription>
                See a detailed breakdown of your loan payments over time.
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
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Loan Amount ({currencySymbols[currency]})</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest">Interest Rate (% p.a.)</Label>
                  <Input
                    id="interest"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Loan Term (Years)</Label>
                  <Input
                    id="term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

            {amortizationData.length > 0 && (
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Amortization Table</CardTitle>
                    <CardDescription>Yearly and monthly breakdown of your loan payments.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">Year</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Total Payment</TableHead>
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
