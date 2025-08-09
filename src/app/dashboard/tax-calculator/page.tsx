'use client';

import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const taxBrackets = {
  single: [
    { rate: 0.1, max: 11000 },
    { rate: 0.12, max: 44725 },
    { rate: 0.22, max: 95375 },
    { rate: 0.24, max: 182100 },
    { rate: 0.32, max: 231250 },
    { rate: 0.35, max: 578125 },
    { rate: 0.37, max: Infinity },
  ],
  marriedFilingJointly: [
    { rate: 0.1, max: 22000 },
    { rate: 0.12, max: 89450 },
    { rate: 0.22, max: 190750 },
    { rate: 0.24, max: 364200 },
    { rate: 0.32, max: 462500 },
    { rate: 0.35, max: 693750 },
    { rate: 0.37, max: Infinity },
  ],
};

type FilingStatus = keyof typeof taxBrackets;
type TaxBracket = { rate: number; amount: number };

export default function TaxCalculatorPage() {
  const [income, setIncome] = useState('75000');
  const [deductions, setDeductions] = useState('13850');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBracket[]>([]);

  const calculateTax = () => {
    const incomeNum = parseFloat(income);
    const deductionsNum = parseFloat(deductions);

    if (isNaN(incomeNum) || isNaN(deductionsNum) || incomeNum < 0) {
      setTotalTax(null);
      setTaxBreakdown([]);
      return;
    }

    const taxableIncome = Math.max(0, incomeNum - deductionsNum);
    const brackets = taxBrackets[filingStatus];

    let remainingIncome = taxableIncome;
    let calculatedTax = 0;
    let previousMax = 0;
    const breakdown: TaxBracket[] = [];

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max - previousMax
      );
      const taxForBracket = taxableInBracket * bracket.rate;
      
      if (taxableInBracket > 0) {
        breakdown.push({
          rate: bracket.rate * 100,
          amount: taxForBracket,
        });
      }

      calculatedTax += taxForBracket;
      remainingIncome -= taxableInBracket;
      previousMax = bracket.max;
    }

    setTotalTax(calculatedTax);
    setTaxBreakdown(breakdown);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
        <h1 className="font-headline text-xl font-semibold">Tax Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Detailed Income Tax Calculator
              </CardTitle>
              <CardDescription>
                Estimate your income tax based on filing status and deductions.
                This is a simplified model for illustrative purposes only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income ($)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 75000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions ($)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    placeholder="e.g., 13850"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Filing Status</Label>
                  <Select
                    value={filingStatus}
                    onValueChange={(val) => setFilingStatus(val as FilingStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="marriedFilingJointly">
                        Married Filing Jointly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateTax} className="mt-4">
                Calculate Tax
              </Button>
              {totalTax !== null && (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calculation Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="rounded-lg border p-4">
                         <h3 className="font-headline text-lg font-semibold">
                          Estimated Total Tax:
                         </h3>
                         <p className="text-3xl font-bold text-primary">
                          ${totalTax.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2})}
                         </p>
                       </div>
                       <div>
                         <h4 className="font-headline text-md mb-2 font-semibold">
                           Tax Breakdown:
                         </h4>
                         <Table>
                           <TableHeader>
                             <TableRow>
                               <TableHead>Tax Rate</TableHead>
                               <TableHead className="text-right">Tax Amount</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {taxBreakdown.map((bracket, index) => (
                               <TableRow key={index}>
                                 <TableCell>{bracket.rate}%</TableCell>
                                 <TableCell className="text-right">
                                   $
                                   {bracket.amount.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2})}
                                 </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
