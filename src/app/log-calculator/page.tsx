'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    // Limit precision for display to avoid long repeating decimals
    const precision = Math.max(1, Math.min(8, 8 - Math.floor(Math.log10(Math.abs(num)))));
    return num.toPrecision(precision).replace(/\.?0+$/, "");
};

export default function LogCalculatorPage() {
    const [base, setBase] = useState('10');
    const [xValue, setXValue] = useState('100');
    const [yValue, setYValue] = useState('');
    const [lastChanged, setLastChanged] = useState<'base' | 'x' | 'y'>('y');
    const [solution, setSolution] = useState<string | null>(null);
    const [steps, setSteps] = useState('');

    const calculate = () => {
        const b = parseFloat(base);
        const x = parseFloat(xValue);
        const y = parseFloat(yValue);

        let calculatedSteps = '';
        let finalSolution = '';

        try {
             if (lastChanged === 'x' || lastChanged === 'base') { // Calculate y
                if (isNaN(b) || isNaN(x) || b <= 0 || b === 1 || x <= 0) { throw new Error('Invalid input for calculating y.'); }
                const resultY = Math.log(x) / Math.log(b);
                setYValue(formatNumber(resultY));
                finalSolution = `y = ${formatNumber(resultY)}`;
                calculatedSteps = `y = log(${formatNumber(b)})(${formatNumber(x)}) = ${formatNumber(resultY)}`;
            } else if (lastChanged === 'y') { // Calculate x
                if (isNaN(b) || isNaN(y) || b <= 0 || b === 1) { throw new Error('Invalid input for calculating x.'); }
                const resultX = Math.pow(b, y);
                setXValue(formatNumber(resultX));
                finalSolution = `x = ${formatNumber(resultX)}`;
                calculatedSteps = `x = ${formatNumber(b)} ^ ${formatNumber(y)} = ${formatNumber(resultX)}`;
            }
            setSolution(finalSolution);
            setSteps(calculatedSteps);
        } catch(e) {
            setSolution((e as Error).message);
            setSteps('');
        }
    };
    
    // Auto-calculate when inputs change
    useEffect(() => {
        calculate();
    }, [base, xValue, yValue, lastChanged]);


    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Logarithm Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Logarithm Calculator</CardTitle>
                            <CardDescription>
                                Solve for any variable in the equation log<sub>b</sub>(x) = y. Enter any two values to find the third.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-light">log</span>
                                    <div className="flex flex-col items-center">
                                        <Input
                                            type="number"
                                            value={base}
                                            onChange={e => { setBase(e.target.value); setLastChanged('base'); }}
                                            className="w-20 text-center text-sm"
                                            aria-label="Base"
                                        />
                                        <Label>Base (b)</Label>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                     <Input
                                        type="number"
                                        value={xValue}
                                        onChange={e => { setXValue(e.target.value); setLastChanged('x'); }}
                                        className="w-32 text-center text-xl font-bold"
                                        aria-label="Argument"
                                    />
                                     <Label>Argument (x)</Label>
                                </div>
                                <div className="text-4xl font-light mx-2">=</div>
                                <div className="flex flex-col items-center">
                                    <Input
                                        type="number"
                                        value={yValue}
                                        onChange={e => { setYValue(e.target.value); setLastChanged('y'); }}
                                        className="w-32 text-center text-xl font-bold text-primary"
                                        aria-label="Result"
                                    />
                                     <Label>Result (y)</Label>
                                </div>
                            </div>

                             {solution && (
                                <Card className="mt-6 bg-muted/50">
                                    <CardHeader>
                                        <CardTitle>Solution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-primary break-all">{solution}</p>
                                        {steps && <p className="font-mono text-sm mt-2">{steps}</p>}
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What is a logarithm?</AccordionTrigger>
                                    <AccordionContent>
                                        A logarithm is the inverse operation to exponentiation. It answers the question: "What exponent do we need to raise a specific base to, to get a certain number?" For example, the logarithm of 100 to base 10 is 2, because 10² = 100. This is written as log₁₀(100) = 2.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>What are the constraints for logarithms?</AccordionTrigger>
                                    <AccordionContent>
                                       For a logarithm log<sub>b</sub>(x) to be a real number, the following conditions must be met:
                                       <ul className="list-disc pl-5 mt-2">
                                         <li>The base `b` must be positive and not equal to 1 (b > 0 and b ≠ 1).</li>
                                         <li>The argument `x` must be positive (x > 0).</li>
                                       </ul>
                                       This calculator respects these mathematical rules.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What is the relationship between logs and exponents?</AccordionTrigger>
                                    <AccordionContent>
                                        Logarithms and exponents are inverse functions. The equation log<sub>b</sub>(x) = y is equivalent to the exponential equation b<sup>y</sup> = x. This calculator allows you to solve for any of the variables `b`, `x`, or `y` in this relationship. Try our <Link href="/exponent-calculator" className="text-primary underline">Exponent Calculator</Link> for related calculations.
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-4">
                                    <AccordionTrigger>What are common logarithms and natural logarithms?</AccordionTrigger>
                                    <AccordionContent>
                                        A **common logarithm** (log) has a base of 10. It's widely used in science and engineering. A **natural logarithm** (ln) has a base of the mathematical constant 'e' (approximately 2.718). It is common in mathematics, physics, and finance for describing growth and decay processes.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-5">
                                    <AccordionTrigger>What are some real-world applications of logarithms?</AccordionTrigger>
                                    <AccordionContent>
                                       Logarithms are used in many fields to handle numbers that span a wide range of values. Examples include measuring the intensity of earthquakes (Richter scale), sound levels (decibels), and the pH of chemical solutions. They are also fundamental in computer science for analyzing the complexity of algorithms.
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