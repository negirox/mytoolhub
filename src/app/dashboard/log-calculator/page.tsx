
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

// Function to parse potentially fractional input
const parseValue = (input: string): number => {
    if (input.toLowerCase() === 'e') {
        return Math.E;
    }
    if (input.includes('/')) {
        const parts = input.split('/');
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
            return num / den;
        }
    }
    return parseFloat(input);
};

// Function to format numbers for display, avoiding unnecessary decimals
const formatNumber = (num: number): string => {
    if (Number.isInteger(num)) {
        return num.toString();
    }
     // Limit precision for display to avoid long repeating decimals
    const precision = Math.max(1, Math.min(15, 15 - Math.floor(Math.log10(Math.abs(num)))));
    const formatted = num.toPrecision(precision);
    // Remove trailing zeros after decimal, but keep decimal if it's .0
    return parseFloat(formatted).toString();
};

export default function LogCalculatorPage() {
    const [base, setBase] = useState('e');
    const [argument, setArgument] = useState('100');
    const [result, setResult] = useState('');
    const [lastChanged, setLastChanged] = useState<'base' | 'argument' | 'result'>('argument');
    const [calculation, setCalculation] = useState('');

    useEffect(() => {
        const valBase = parseValue(base);
        const valArg = parseValue(argument);
        const valRes = parseValue(result);

        let newResult = '';
        let newCalc = '';

        try {
            if (lastChanged === 'base' || lastChanged === 'argument') {
                if (!isNaN(valBase) && valBase > 0 && valBase !== 1 && !isNaN(valArg) && valArg > 0) {
                    const res = Math.log(valArg) / Math.log(valBase);
                    newResult = formatNumber(res);
                    newCalc = `${base}^${newResult} = ${argument}`;
                }
            } else if (lastChanged === 'result') {
                if (base === '' && !isNaN(valArg) && !isNaN(valRes) && valArg > 0) {
                    // Calculate base
                    const b = Math.pow(valArg, 1 / valRes);
                    setBase(formatNumber(b));
                    newCalc = `${formatNumber(b)}^${result} = ${argument}`;
                } else if (argument === '' && !isNaN(valBase) && !isNaN(valRes) && valBase > 0 && valBase !== 1) {
                    // Calculate argument
                    const arg = Math.pow(valBase, valRes);
                    setArgument(formatNumber(arg));
                    newCalc = `${base}^${result} = ${formatNumber(arg)}`;
                }
            }
             if(newResult) setResult(newResult);
             if(newCalc) setCalculation(newCalc);

        } catch(e) {
            setResult('Error');
            setCalculation('');
        }

    }, [base, argument, result, lastChanged]);


    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBase(e.target.value);
        if(e.target.value !== '') setLastChanged('base');
    };
    const handleArgumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArgument(e.target.value);
        if(e.target.value !== '') setLastChanged('argument');
    };
    const handleResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(e.target.value);
        if(e.target.value !== '') setLastChanged('result');
    };


    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Logarithm Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Log Calculator</CardTitle>
                            <CardDescription>
                                Solve for any variable in the equation `log_b(x) = y`. Enter any two values to find the third. Accepts 'e' as a base.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center text-lg md:text-xl">
                                <span>log</span>
                                <Input
                                    value={base}
                                    onChange={handleBaseChange}
                                    className="w-20 text-center text-xs self-end"
                                    aria-label="Base"
                                    placeholder="b"
                                />
                                 <Input
                                    value={argument}
                                    onChange={handleArgumentChange}
                                    className="w-32 text-center font-bold"
                                    aria-label="Argument (x)"
                                    placeholder="x"
                                />
                                <span>=</span>
                                 <Input
                                    value={result}
                                    onChange={handleResultChange}
                                    className="w-48 text-center text-primary font-bold"
                                    aria-label="Result (y)"
                                    placeholder="y"
                                />
                            </div>

                            {result && calculation && (
                                <Card className="mt-6 bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Result</CardTitle>
                                    </CardHeader>
                                    <CardContent className="font-mono text-sm space-y-2 break-all text-center">
                                       <p className="text-xl font-bold text-primary">log<sub>{base}</sub>({argument}) = {result}</p>
                                       <p className="text-muted-foreground">({calculation})</p>
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Related Calculators</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <Button asChild variant="outline"><Link href="/dashboard/scientific-calculator">Scientific Calculator</Link></Button>
                            <Button asChild variant="outline"><Link href="/dashboard/exponent-calculator">Exponent Calculator</Link></Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">What is a Logarithm?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>The logarithm, or log, is the inverse of the mathematical operation of exponentiation. This means that the log of a number is the number that a fixed base has to be raised to in order to yield the number. Conventionally, "log" implies that base 10 is being used, though the base can technically be anything. When the base is e, "ln" is usually written, rather than loge. log₂, the binary logarithm, is another base that is typically used with logarithms. If, for example:</p>
                            <p className="font-mono p-4 bg-muted rounded-md text-center">x = b<sup>y</sup>; then y = log<sub>b</sub>x; where b is the base</p>
                            <p>Each of the mentioned bases is typically used in different applications. Base 10 is commonly used in science and engineering, base e in math and physics, and base 2 in computer science.</p>
                             <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="font-headline text-lg text-foreground">Basic Log Rules</AccordionTrigger>
                                    <AccordionContent className="space-y-6 pt-4">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Product Rule</h4>
                                            <p>The logarithm of a product is the sum of the logarithms of the factors.</p>
                                            <p className="font-mono p-2 bg-muted rounded-md mt-1">log<sub>b</sub>(x × y) = log<sub>b</sub>x + log<sub>b</sub>y</p>
                                            <p className="text-xs mt-1">EX: log(1 × 10) = log(1) + log(10) = 0 + 1 = 1</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-foreground">Quotient Rule</h4>
                                            <p>The logarithm of a ratio is the difference of the logarithms.</p>
                                            <p className="font-mono p-2 bg-muted rounded-md mt-1">log<sub>b</sub>(x / y) = log<sub>b</sub>x - log<sub>b</sub>y</p>
                                            <p className="text-xs mt-1">EX: log(10 / 2) = log(10) - log(2) = 1 - 0.301 = 0.699</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-foreground">Power Rule</h4>
                                            <p>The logarithm of a power is the exponent times the logarithm of the base.</p>
                                            <p className="font-mono p-2 bg-muted rounded-md mt-1">log<sub>b</sub>(x<sup>y</sup>) = y × log<sub>b</sub>x</p>
                                            <p className="text-xs mt-1">EX: log(2⁶) = 6 × log(2) ≈ 1.806</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-foreground">Change of Base Rule</h4>
                                            <p>Allows you to change the base of a logarithm.</p>
                                            <p className="font-mono p-2 bg-muted rounded-md mt-1">log<sub>b</sub>(x) = log<sub>k</sub>(x) / log<sub>k</sub>(b)</p>
                                            <p className="text-xs mt-1">EX: log₁₀(100) = log₂(100) / log₂(10)</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold text-foreground">Reciprocal Rule</h4>
                                            <p>Allows you to switch the base and the argument.</p>
                                            <p className="font-mono p-2 bg-muted rounded-md mt-1">log<sub>b</sub>(c) = 1 / log<sub>c</sub>(b)</p>
                                            <p className="text-xs mt-1">EX: log₅(2) = 1 / log₂(5)</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">Other Common Identities</h4>
                                            <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-sm">
                                                <li>log<sub>b</sub>(1) = 0</li>
                                                <li>log<sub>b</sub>(b) = 1</li>
                                                <li>log<sub>b</sub>(0) = undefined</li>
                                                <li>lim <sub>x→0+</sub> log<sub>b</sub>(x) = -∞</li>
                                                <li>ln(e<sup>x</sup>) = x</li>
                                            </ul>
                                        </div>
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
