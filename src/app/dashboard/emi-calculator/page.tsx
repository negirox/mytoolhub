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
import { Slider } from '@/components/ui/slider';

export default function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState('100000');
  const [interestRate, setInterestRate] = useState('7.5');
  const [tenure, setTenure] = useState('10');
  const [emi, setEmi] = useState<number | null>(null);

  const calculateEmi = () => {
    const p = parseFloat(principal);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseFloat(tenure) * 12;

    if (p > 0 && r > 0 && n > 0) {
      const emiValue = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmi(emiValue);
    } else {
      setEmi(null);
    }
  };

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
                Calculate your monthly loan installments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="principal">Loan Amount (₹)</Label>
                  <Input
                    id="principal"
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder="e.g., 100000"
                  />
                  <Slider
                    value={[parseFloat(principal)]}
                    onValueChange={(value) => setPrincipal(String(value[0]))}
                    max={5000000}
                    step={10000}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interest">Interest Rate (% p.a.)</Label>
                  <Input
                    id="interest"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="e.g., 7.5"
                    step="0.1"
                  />
                  <Slider
                    value={[parseFloat(interestRate)]}
                    onValueChange={(value) => setInterestRate(String(value[0]))}
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
                    placeholder="e.g., 10"
                  />
                  <Slider
                    value={[parseFloat(tenure)]}
                    onValueChange={(value) => setTenure(String(value[0]))}
                    max={30}
                    step={1}
                  />
                </div>
              </div>
              <Button onClick={calculateEmi} className="mt-6">
                Calculate EMI
              </Button>
              {emi !== null && (
                <div className="mt-6 rounded-lg border p-4">
                  <h3 className="font-headline text-lg font-semibold">
                    Your Monthly EMI is:
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    ₹{emi.toFixed(2)}
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
