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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type TaxRegime = 'new' | 'old';
type TaxBracket = {
  slab: string;
  rate: string;
  tax: number;
};

// Health and Education Cess
const CESS_RATE = 0.04;

const calculateNewRegimeTax = (taxableIncome: number) => {
  let tax = 0;
  const breakdown: TaxBracket[] = [];
  let income = taxableIncome;

  // Rebate under 87A
  if (taxableIncome <= 700000) {
     breakdown.push({ slab: 'Up to ₹7,00,000', rate: 'Rebate u/s 87A', tax: 0 });
     return { tax: 0, breakdown, totalTax: 0, cess: 0 };
  }

  // Slabs
  if (income > 1500000) {
    const taxableInSlab = income - 1500000;
    const taxInSlab = taxableInSlab * 0.30;
    tax += taxInSlab;
    breakdown.push({ slab: 'Above ₹15,00,000', rate: '30%', tax: taxInSlab });
    income = 1500000;
  }
  if (income > 1200000) {
    const taxableInSlab = income - 1200000;
    const taxInSlab = taxableInSlab * 0.20;
    tax += taxInSlab;
    breakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', tax: taxInSlab });
    income = 1200000;
  }
  if (income > 900000) {
    const taxableInSlab = income - 900000;
    const taxInSlab = taxableInSlab * 0.15;
    tax += taxInSlab;
    breakdown.push({ slab: '₹9,00,001 - ₹12,00,000', rate: '15%', tax: taxInSlab });
    income = 900000;
  }
  if (income > 600000) {
    const taxableInSlab = income - 600000;
    const taxInSlab = taxableInSlab * 0.10;
    tax += taxInSlab;
    breakdown.push({ slab: '₹6,00,001 - ₹9,00,000', rate: '10%', tax: taxInSlab });
    income = 600000;
  }
  if (income > 300000) {
    const taxableInSlab = income - 300000;
    const taxInSlab = taxableInSlab * 0.05;
    tax += taxInSlab;
    breakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', tax: taxInSlab });
  }
  breakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
  
  const cess = tax * CESS_RATE;
  const totalTax = tax + cess;

  return { tax, breakdown: breakdown.reverse(), totalTax, cess };
};

const calculateOldRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    const breakdown: TaxBracket[] = [];
    let income = taxableIncome;

    // Slabs for individuals below 60
    if (income > 1000000) {
        const taxableInSlab = income - 1000000;
        const taxInSlab = taxableInSlab * 0.30;
        tax += taxInSlab;
        breakdown.push({ slab: 'Above ₹10,00,000', rate: '30%', tax: taxInSlab });
        income = 1000000;
    }
    if (income > 500000) {
        const taxableInSlab = income - 500000;
        const taxInSlab = taxableInSlab * 0.20;
        tax += taxInSlab;
        breakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', tax: taxInSlab });
        income = 500000;
    }
    if (income > 250000) {
        const taxableInSlab = income - 250000;
        const taxInSlab = taxableInSlab * 0.05;
        tax += taxInSlab;
        breakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', tax: taxInSlab });
    }
    breakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
    
    // Rebate under 87A
    if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
    }

    const incomeTax = tax > 0 ? tax : 0;
    const cess = incomeTax * CESS_RATE;
    const totalTax = incomeTax + cess;

    return { tax: incomeTax, breakdown: breakdown.reverse(), totalTax, cess };
};


export default function TaxCalculatorPage() {
  const [income, setIncome] = useState('1000000');
  const [deductions, setDeductions] = useState('50000');
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBracket[]>([]);
  const [taxableIncome, setTaxableIncome] = useState<number | null>(null);
  const [cess, setCess] = useState<number | null>(null);


  const calculateTax = () => {
    const incomeNum = parseFloat(income);
    let deductionsNum = parseFloat(deductions);

    if (isNaN(incomeNum) || incomeNum < 0) {
      setTotalTax(null);
      setTaxBreakdown([]);
      return;
    }

    if (taxRegime === 'new') {
      deductionsNum = 50000; // Standard deduction is fixed for the new regime
      setDeductions('50000');
    }

    if (isNaN(deductionsNum)) deductionsNum = 0;

    const finalTaxableIncome = Math.max(0, incomeNum - deductionsNum);
    setTaxableIncome(finalTaxableIncome);

    const result =
      taxRegime === 'new'
        ? calculateNewRegimeTax(finalTaxableIncome)
        : calculateOldRegimeTax(finalTaxableIncome);

    setTotalTax(result.totalTax);
    setTaxBreakdown(result.breakdown);
    setCess(result.cess);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
        <h1 className="font-headline text-xl font-semibold">
          Indian Tax Calculator
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Indian Income Tax Calculator (FY 2023-24)
              </CardTitle>
              <CardDescription>
                Estimate your tax liability under the Old and New tax regimes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (₹)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 1000000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions (₹)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    placeholder="e.g., 50000"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    disabled={taxRegime === 'new'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Regime</Label>
                  <Select
                    value={taxRegime}
                    onValueChange={(val) => {
                      const newRegime = val as TaxRegime;
                      setTaxRegime(newRegime);
                      if (newRegime === 'new') {
                        setDeductions('50000');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Regime (Default)</SelectItem>
                      <SelectItem value="old">Old Regime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
               {taxRegime === 'new' && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      Under the New Tax Regime, a standard deduction of ₹50,000 is automatically applied for salaried individuals and pensioners. Other deductions are generally not applicable.
                    </AlertDescription>
                  </Alert>
                )}
              <Button onClick={calculateTax} className="mt-4">
                Calculate Tax
              </Button>

              {totalTax !== null && taxableIncome !== null && cess !== null && (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calculation Results</CardTitle>
                      <CardDescription>
                         Based on a taxable income of ₹{taxableIncome.toLocaleString('en-IN')}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <h3 className="font-headline text-lg font-semibold">
                          Total Tax Payable:
                        </h3>
                        <p className="text-3xl font-bold text-primary">
                          ₹
                          {totalTax.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </p>
                         <p className="text-sm text-muted-foreground">
                          (Includes Health & Education Cess of ₹{cess.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2})})
                        </p>
                      </div>
                      <div>
                        <h4 className="font-headline text-md mb-2 font-semibold">
                          Tax Breakdown:
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Income Slab (₹)</TableHead>
                              <TableHead>Tax Rate</TableHead>
                              <TableHead className="text-right">
                                Tax Amount (₹)
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {taxBreakdown.map((bracket, index) => (
                              <TableRow key={index}>
                                <TableCell>{bracket.slab}</TableCell>
                                <TableCell>{bracket.rate}</TableCell>
                                <TableCell className="text-right">
                                  {bracket.tax.toLocaleString('en-IN', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                  })}
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
