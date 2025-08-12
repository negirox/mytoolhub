
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Helper function to find the greatest common divisor
const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

interface Fraction {
    num: number;
    den: number;
}

const simplify = (frac: Fraction): Fraction => {
    const commonDivisor = gcd(Math.abs(frac.num), Math.abs(frac.den));
    return {
        num: frac.num / commonDivisor,
        den: frac.den / commonDivisor,
    };
};

export default function FractionCalculatorPage() {
  const [num1, setNum1] = useState('1');
  const [den1, setDen1] = useState('2');
  const [num2, setNum2] = useState('1');
  const [den2, setDen2] = useState('4');
  const [operator, setOperator] = useState('+');
  const [result, setResult] = useState<Fraction | string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const calculate = () => {
    const n1 = parseInt(num1);
    const d1 = parseInt(den1);
    const n2 = parseInt(num2);
    const d2 = parseInt(den2);

    if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2)) {
      setResult('Invalid Input');
      return;
    }
    if (d1 === 0 || d2 === 0) {
      setResult('Denominator cannot be zero');
      return;
    }

    let res: Fraction;
    switch (operator) {
      case '+':
        res = { num: n1 * d2 + n2 * d1, den: d1 * d2 };
        break;
      case '-':
        res = { num: n1 * d2 - n2 * d1, den: d1 * d2 };
        break;
      case '×':
        res = { num: n1 * n2, den: d1 * d2 };
        break;
      case '÷':
        if (n2 === 0) {
          setResult('Cannot divide by zero fraction');
          return;
        }
        res = { num: n1 * d2, den: d1 * n2 };
        break;
      default:
        return;
    }
    
    const simplifiedResult = simplify(res);
    setResult(simplifiedResult);

    const calculation = `${n1}/${d1} ${operator} ${n2}/${d2} = ${simplifiedResult.num}/${simplifiedResult.den}`;
    setHistory(prev => [calculation, ...prev].slice(0, 10));
  };
  
  const displayResult = useMemo(() => {
    if (!result) return '...';
    if (typeof result === 'string') return result;
    if (result.den === 1) return `${result.num}`;
    return `${result.num} / ${result.den}`;
  }, [result]);

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Fraction Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="shadow-2xl">
                    <CardHeader>
                    <CardTitle className="font-headline">Fraction Calculator</CardTitle>
                    <CardDescription>Perform arithmetic operations on fractions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            {/* First Fraction */}
                            <div className="flex flex-col items-center gap-1">
                                <Input type="number" value={num1} onChange={e => setNum1(e.target.value)} className="w-24 text-center" placeholder="Numerator" />
                                <hr className="w-full border-t-2 border-foreground" />
                                <Input type="number" value={den1} onChange={e => setDen1(e.target.value)} className="w-24 text-center" placeholder="Denominator" />
                            </div>
                            
                            {/* Operator */}
                            <Select value={operator} onValueChange={setOperator}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="+">+</SelectItem>
                                    <SelectItem value="-">-</SelectItem>
                                    <SelectItem value="×">×</SelectItem>
                                    <SelectItem value="÷">÷</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Second Fraction */}
                            <div className="flex flex-col items-center gap-1">
                                <Input type="number" value={num2} onChange={e => setNum2(e.target.value)} className="w-24 text-center" placeholder="Numerator" />
                                <hr className="w-full border-t-2 border-foreground" />
                                <Input type="number" value={den2} onChange={e => setDen2(e.target.value)} className="w-24 text-center" placeholder="Denominator" />
                            </div>

                            {/* Equals and Result */}
                             <div className="text-2xl font-bold">=</div>
                             <div className="flex items-center justify-center rounded-lg border p-4 min-w-[150px] text-center">
                                <p className="text-3xl font-bold text-primary">{displayResult}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Button onClick={calculate} size="lg">Calculate</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">History</CardTitle>
                        <CardDescription>Your last 10 calculations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">No calculations yet.</p>
                        ) : (
                            <ul className="space-y-2 text-sm">
                                {history.map((calc, index) => (
                                    <li key={index} className="p-2 rounded-md bg-muted/50 truncate text-right">
                                        {calc}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
         <div className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is a fraction?</AccordionTrigger>
                            <AccordionContent>
                            A fraction represents a part of a whole. It consists of a numerator (the top number), which indicates how many parts you have, and a denominator (the bottom number), which indicates how many equal parts the whole is divided into.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How does this calculator simplify fractions?</AccordionTrigger>
                            <AccordionContent>
                             After performing a calculation, the calculator finds the greatest common divisor (GCD) of the resulting numerator and denominator. It then divides both by the GCD to present the fraction in its simplest (or lowest) terms.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is an improper fraction?</AccordionTrigger>
                            <AccordionContent>
                            An improper fraction is one where the numerator is greater than or equal to the denominator (e.g., 5/4). This calculator handles both proper and improper fractions in its calculations and results. The result is kept as an improper fraction rather than being converted to a mixed number.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do you add or subtract fractions?</AccordionTrigger>
                            <AccordionContent>
                            To add or subtract fractions, you must first find a common denominator. This calculator does this by multiplying the two denominators. Then, it adjusts the numerators accordingly, performs the addition or subtraction, and simplifies the result.
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-5">
                            <AccordionTrigger>How do you multiply or divide fractions?</AccordionTrigger>
                            <AccordionContent>
                            Multiplying fractions is straightforward: multiply the numerators together and the denominators together. To divide fractions, you invert the second fraction (swap its numerator and denominator) and then multiply. The calculator handles these operations and simplifies the final result.
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
