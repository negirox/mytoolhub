
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ExponentCalculatorPage() {
    const [base, setBase] = useState('2');
    const [exponent, setExponent] = useState('5');
    const [result, setResult] = useState('');
    const [useE, setUseE] = useState(false);
    const [lastChanged, setLastChanged] = useState<'base' | 'exponent' | 'result'>('exponent');
    const [steps, setSteps] = useState('');

    const calculate = () => {
        let b = useE ? Math.E : parseFloat(base);
        let exp = parseFloat(exponent);
        let res = parseFloat(result);

        let calculatedSteps = '';

        if (lastChanged === 'base' || lastChanged === 'exponent') {
            // Calculate result
            if (!isNaN(b) && !isNaN(exp)) {
                const newResult = Math.pow(b, exp);
                setResult(newResult.toString());
                if (Number.isInteger(exp) && exp > 0 && exp <= 10) {
                    calculatedSteps = `${b}${'\u00D7'.repeat(exp - 1).split('').join(`${b}`)} = ${newResult}`;
                } else {
                    calculatedSteps = `${b} ^ ${exp} = ${newResult}`;
                }
            }
        } else if (lastChanged === 'result') {
            // Calculate exponent or base
            if (!isNaN(res) && !isNaN(b) && b > 0 && res > 0) {
                // Calculate exponent
                const newExponent = Math.log(res) / Math.log(b);
                setExponent(newExponent.toString());
                calculatedSteps = `log(${b})(${res}) = ${newExponent}`;

            } else if (!isNaN(res) && !isNaN(exp) && res >= 0) {
                // Calculate base
                const newBase = Math.pow(res, 1 / exp);
                setBase(newBase.toString());
                 if (!useE) setBase(newBase.toString());
                 calculatedSteps = `${exp}√${res} = ${newBase}`;
            }
        }
        setSteps(calculatedSteps);
    };

    useEffect(() => {
        calculate();
    }, [base, exponent, result, useE, lastChanged]);

    useEffect(() => {
        if(useE) {
            setLastChanged('exponent'); // Or 'result', depending on desired behavior
        }
    }, [useE]);


    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBase(e.target.value);
        setLastChanged('base');
    };
    const handleExponentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExponent(e.target.value);
        setLastChanged('exponent');
    };
    const handleResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(e.target.value);
        setLastChanged('result');
    };

    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Exponent Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Exponent Calculator</CardTitle>
                            <CardDescription>
                                Enter any two values (base, exponent, or result) to solve for the third.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-center">
                                <div className="flex flex-col items-center">
                                    <Input
                                        type="number"
                                        value={useE ? 'e' : base}
                                        onChange={handleBaseChange}
                                        className="w-32 text-center text-2xl font-bold"
                                        disabled={useE}
                                        aria-label="Base"
                                    />
                                    <Label>Base</Label>
                                </div>
                                <div className="text-4xl font-light text-muted-foreground self-start pt-1">^</div>
                                <div className="flex flex-col items-center">
                                    <Input
                                        type="number"
                                        value={exponent}
                                        onChange={handleExponentChange}
                                        className="w-32 text-center text-lg"
                                        aria-label="Exponent"
                                    />
                                     <Label>Exponent</Label>
                                </div>
                                <div className="text-4xl font-light mx-2">=</div>
                                <div className="flex flex-col items-center">
                                    <Input
                                        type="number"
                                        value={result}
                                        onChange={handleResultChange}
                                        className="w-48 text-center text-2xl font-bold text-primary"
                                        aria-label="Result"
                                    />
                                     <Label>Result</Label>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-center space-x-2">
                                <Checkbox id="use-e" checked={useE} onCheckedChange={(checked) => setUseE(Boolean(checked))} />
                                <Label htmlFor="use-e" className="text-sm font-medium">Use 'e' as base</Label>
                            </div>

                            {steps && (
                                <Card className="mt-6 bg-muted/50">
                                    <CardHeader>
                                        <CardTitle>Steps</CardTitle>
                                    </CardHeader>
                                    <CardContent className="font-mono text-sm break-all text-center">
                                        <p>{steps}</p>
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
                                    <AccordionTrigger>What is an exponent?</AccordionTrigger>
                                    <AccordionContent>
                                        An exponent refers to the number of times a number (the base) is multiplied by itself. For example, in 2⁵, the base is 2 and the exponent is 5. This means you multiply 2 by itself 5 times: 2 × 2 × 2 × 2 × 2 = 32.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>How does this calculator solve for the exponent?</AccordionTrigger>
                                    <AccordionContent>
                                        To find a missing exponent (e.g., 2ˣ = 32), the calculator uses logarithms. The formula is x = log(result) / log(base). A logarithm is the inverse operation of exponentiation, essentially asking "what exponent produces this result?".
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>How does this calculator solve for the base?</AccordionTrigger>
                                    <AccordionContent>
                                        To find a missing base (e.g., x⁵ = 32), the calculator uses roots. The formula is x = result^(1/exponent). This is the same as finding the 'exponent-th' root of the result. For example, the 5th root of 32 is 2.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>What is 'e'?</AccordionTrigger>
                                    <AccordionContent>
                                        'e' is a special mathematical constant, approximately equal to 2.71828. It is the base of the natural logarithm and appears in many formulas related to growth and change, such as compound interest and population growth. Using it as a base is common in scientific and financial calculations.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-5">
                                    <AccordionTrigger>What are some real-world examples of exponents?</AccordionTrigger>
                                    <AccordionContent>
                                        Exponents are used everywhere. For example, calculating compound interest uses exponents to determine how money grows over time. In science, they are used to express very large or small numbers (scientific notation) and describe things like radioactive decay or bacterial growth. In computing, they are fundamental to understanding data storage (e.g., kilobytes, megabytes).
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
