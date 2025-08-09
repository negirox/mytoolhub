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

export default function TaxCalculatorPage() {
  const [income, setIncome] = useState('');
  const [tax, setTax] = useState<number | null>(null);

  const calculateTax = () => {
    const incomeNum = parseFloat(income);
    if (incomeNum > 0) {
      let taxValue = 0;
      if (incomeNum > 250000) {
        if (incomeNum <= 500000) {
          taxValue = (incomeNum - 250000) * 0.05;
        } else if (incomeNum <= 1000000) {
          taxValue = (250000 * 0.05) + (incomeNum - 500000) * 0.20;
        } else {
          taxValue = (250000 * 0.05) + (500000 * 0.20) + (incomeNum - 1000000) * 0.30;
        }
      }
      setTax(taxValue);
    } else {
      setTax(null);
    }
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
                Simple Income Tax Calculator
              </CardTitle>
              <CardDescription>
                Estimate your income tax based on a simplified model. This is for illustrative purposes only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="income">Your Annual Income (₹)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="e.g., 750000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>
              <Button onClick={calculateTax} className="mt-4">
                Calculate Tax
              </Button>
              {tax !== null && (
                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="font-headline text-lg font-semibold">
                    Estimated Income Tax:
                  </h3>
                   <p className="text-3xl font-bold text-primary">
                    ₹{tax.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
