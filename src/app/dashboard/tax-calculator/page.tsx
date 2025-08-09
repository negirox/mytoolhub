'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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
    const taxInSlab = taxableInSlab * 0.3;
    tax += taxInSlab;
    breakdown.push({
      slab: 'Above ₹15,00,000',
      rate: '30%',
      tax: taxInSlab,
    });
    income = 1500000;
  }
  if (income > 1200000) {
    const taxableInSlab = income - 1200000;
    const taxInSlab = taxableInSlab * 0.2;
    tax += taxInSlab;
    breakdown.push({
      slab: '₹12,00,001 - ₹15,00,000',
      rate: '20%',
      tax: taxInSlab,
    });
    income = 1200000;
  }
  if (income > 900000) {
    const taxableInSlab = income - 900000;
    const taxInSlab = taxableInSlab * 0.15;
    tax += taxInSlab;
    breakdown.push({
      slab: '₹9,00,001 - ₹12,00,000',
      rate: '15%',
      tax: taxInSlab,
    });
    income = 900000;
  }
  if (income > 600000) {
    const taxableInSlab = income - 600000;
    const taxInSlab = taxableInSlab * 0.1;
    tax += taxInSlab;
    breakdown.push({
      slab: '₹6,00,001 - ₹9,00,000',
      rate: '10%',
      tax: taxInSlab,
    });
    income = 600000;
  }
  if (income > 300000) {
    const taxableInSlab = income - 300000;
    const taxInSlab = taxableInSlab * 0.05;
    tax += taxInSlab;
    breakdown.push({
      slab: '₹3,00,001 - ₹6,00,000',
      rate: '5%',
      tax: taxInSlab,
    });
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
    const taxInSlab = taxableInSlab * 0.3;
    tax += taxInSlab;
    breakdown.push({
      slab: 'Above ₹10,00,000',
      rate: '30%',
      tax: taxInSlab,
    });
    income = 1000000;
  }
  if (income > 500000) {
    const taxableInSlab = income - 500000;
    const taxInSlab = taxableInSlab * 0.2;
    tax += taxInSlab;
    breakdown.push({
      slab: '₹5,00,001 - ₹10,00,000',
      rate: '20%',
      tax: taxInSlab,
    });
    income = 500000;
  }
  if (income > 250000) {
    const taxableInSlab = income - 250000;
    const taxInSlab = taxableInSlab * 0.05;
    tax += taxInSlab;
    breakdown.push({
      slab: '₹2,50,001 - ₹5,00,000',
      rate: '5%',
      tax: taxInSlab,
    });
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
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBracket[]>([]);
  const [taxableIncome, setTaxableIncome] = useState<number | null>(null);
  const [cess, setCess] = useState<number | null>(null);

  // Detailed deductions state
  const [standardDeduction, setStandardDeduction] = useState('50000');
  const [section80c, setSection80c] = useState('0');
  const [section80d, setSection80d] = useState('0');
  const [section80tta, setSection80tta] = useState('0');
  const [hra, setHra] = useState('0');
  const [homeLoanInterest, setHomeLoanInterest] = useState('0');
  const [otherDeductions, setOtherDeductions] = useState('0');
  
  const financialYear = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    let startYear;
    let endYear;

    if (currentMonth < 3) { // Before April (Jan, Feb, Mar)
      startYear = currentYear - 1;
      endYear = currentYear;
    } else { // April and after
      startYear = currentYear;
      endYear = currentYear + 1;
    }
    return `FY ${startYear}-${String(endYear).slice(-2)}`;
  }, []);

  const calculateTax = () => {
    const incomeNum = parseFloat(income);
    
    if (isNaN(incomeNum) || incomeNum < 0) {
      setTotalTax(null);
      setTaxBreakdown([]);
      return;
    }
    
    let totalDeductions = 0;
    if (taxRegime === 'new') {
        totalDeductions = parseFloat(standardDeduction) || 0;
    } else {
        totalDeductions = [
            standardDeduction,
            section80c,
            section80d,
            section80tta,
            hra,
            homeLoanInterest,
            otherDeductions,
        ].reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    }

    const finalTaxableIncome = Math.max(0, incomeNum - totalDeductions);
    setTaxableIncome(finalTaxableIncome);

    const result =
      taxRegime === 'new'
        ? calculateNewRegimeTax(finalTaxableIncome)
        : calculateOldRegimeTax(finalTaxableIncome);

    setTotalTax(result.totalTax);
    setTaxBreakdown(result.breakdown);
    setCess(result.cess);
  };

  const isOldRegime = taxRegime === 'old';

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">
          Indian Tax Calculator
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Indian Income Tax Calculator ({financialYear})
              </CardTitle>
              <CardDescription>
                Estimate your tax liability under the Old and New tax regimes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
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
                  <Label>Tax Regime</Label>
                  <Select
                    value={taxRegime}
                    onValueChange={(val) => setTaxRegime(val as TaxRegime)}
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

              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Deductions</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="standard-deduction">Standard Deduction (₹)</Label>
                        <Input
                          id="standard-deduction"
                          type="number"
                          placeholder="e.g., 50000"
                          value={standardDeduction}
                          onChange={(e) => setStandardDeduction(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section80c">Section 80C (e.g. PF, PPF, ELSS)</Label>
                        <Input
                          id="section80c"
                          type="number"
                          placeholder="Max ₹1,50,000"
                          value={section80c}
                          onChange={(e) => setSection80c(e.target.value)}
                          disabled={!isOldRegime}
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="section80d">Section 80D (Medical Insurance)</Label>
                        <Input
                          id="section80d"
                          type="number"
                          placeholder="e.g., 25000"
                          value={section80d}
                          onChange={(e) => setSection80d(e.target.value)}
                          disabled={!isOldRegime}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hra">House Rent Allowance (HRA)</Label>
                        <Input
                          id="hra"
                          type="number"
                          placeholder="e.g., 100000"
                          value={hra}
                          onChange={(e) => setHra(e.target.value)}
                          disabled={!isOldRegime}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="home-loan-interest">Home Loan Interest (Sec 24)</Label>
                        <Input
                          id="home-loan-interest"
                          type="number"
                          placeholder="Max ₹2,00,000"
                          value={homeLoanInterest}
                          onChange={(e) => setHomeLoanInterest(e.target.value)}
                          disabled={!isOldRegime}
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="section80tta">Section 80TTA (Savings Interest)</Label>
                        <Input
                          id="section80tta"
                          type="number"
                          placeholder="Max ₹10,000"
                          value={section80tta}
                          onChange={(e) => setSection80tta(e.target.value)}
                          disabled={!isOldRegime}
                        />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="other-deductions">Other Deductions</Label>
                        <Input
                          id="other-deductions"
                          type="number"
                          placeholder="e.g., NPS, donations"
                          value={otherDeductions}
                          onChange={(e) => setOtherDeductions(e.target.value)}
                          disabled={!isOldRegime}
                        />
                      </div>
                    </div>
                     {!isOldRegime && (
                        <Alert className="mt-4">
                          <AlertDescription>
                            Under the New Tax Regime, only Standard Deduction is applied. Most other deductions are not applicable.
                          </AlertDescription>
                        </Alert>
                      )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button onClick={calculateTax} className="mt-4 w-full md:w-auto">
                Calculate Tax
              </Button>

              {totalTax !== null &&
                taxableIncome !== null &&
                cess !== null && (
                  <div className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Calculation Results</CardTitle>
                        <CardDescription>
                          Based on a taxable income of ₹
                          {taxableIncome.toLocaleString('en-IN')}.
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
                            (Includes Health & Education Cess of ₹
                            {cess.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}
                            )
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
             <CardFooter>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Disclaimer: This calculator is for illustrative purposes only. For accurate calculations, please consult a tax professional or visit the official 
                    <Button variant="link" size="sm" asChild>
                        <Link href="https://www.incometaxindia.gov.in" target="_blank" rel="noopener noreferrer">
                            Income Tax website <ExternalLink className="size-3 ml-1" />
                        </Link>
                    </Button>.
                </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
