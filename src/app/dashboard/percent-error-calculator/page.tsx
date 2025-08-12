
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function PercentErrorCalculatorPage() {
    const [observedValue, setObservedValue] = useState('10');
    const [trueValue, setTrueValue] = useState('11');

    const { percentError, steps } = useMemo(() => {
        const observed = parseFloat(observedValue);
        const trueVal = parseFloat(trueValue);

        if (isNaN(observed) || isNaN(trueVal) || trueVal === 0) {
            return { percentError: null, steps: null };
        }

        const error = (observed - trueVal) / trueVal * 100;
        
        const calcSteps = {
            numerator: observed - trueVal,
            denominator: trueVal,
            decimalResult: (observed - trueVal) / trueVal,
            percentError: error,
            absoluteError: Math.abs(error),
        };

        return { percentError: error, steps: calcSteps };
    }, [observedValue, trueValue]);

    return (
        <>
        <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
            <h1 className="font-headline text-xl font-semibold">Percent Error Calculator</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Percent Error Calculator</CardTitle>
                        <CardDescription>
                            Calculate the percent error between an observed (measured) value and a true (accepted) value. The calculation updates automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="observed-value">Observed Value (Measured)</Label>
                                <Input id="observed-value" type="number" value={observedValue} onChange={(e) => setObservedValue(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="true-value">True Value (Accepted)</Label>
                                <Input id="true-value" type="number" value={trueValue} onChange={(e) => setTrueValue(e.target.value)} />
                            </div>
                        </div>

                        {percentError !== null && steps && (
                            <div className="mt-6 space-y-4">
                                <Card className="bg-muted/50">
                                    <CardHeader>
                                        <CardTitle>Result</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-primary">
                                            {percentError.toFixed(4)}%
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            (Absolute Error: {steps.absoluteError.toFixed(4)}%)
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Steps</CardTitle>
                                    </CardHeader>
                                    <CardContent className="font-mono text-sm space-y-2 break-all">
                                        <div className="flex items-center gap-2">
                                            <span>Percent Error = </span>
                                            <div className="flex flex-col items-center">
                                                <span>V<sub className="text-xs">observed</sub> - V<sub className="text-xs">true</sub></span>
                                                <hr className="w-full border-foreground" />
                                                <span>V<sub className="text-xs">true</sub></span>
                                            </div>
                                            <span> × 100%</span>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <span>= </span>
                                            <div className="flex flex-col items-center">
                                                <span>{observedValue} - {trueValue}</span>
                                                <hr className="w-full border-foreground" />
                                                <span>{trueValue}</span>
                                            </div>
                                            <span> × 100%</span>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <span>= </span>
                                            <div className="flex flex-col items-center">
                                                <span>{steps.numerator}</span>
                                                <hr className="w-full border-foreground" />
                                                <span>{steps.denominator}</span>
                                            </div>
                                             <span> × 100%</span>
                                        </div>
                                        <p>= {steps.decimalResult.toFixed(8)} × 100%</p>
                                        <p>= {steps.percentError.toFixed(8)}%</p>
                                    </CardContent>
                                </Card>
                            </div>
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
                                <AccordionTrigger>What is Percent Error?</AccordionTrigger>
                                <AccordionContent>
                                    Percent error is a measure of how close an observed or measured value is to a true or accepted value. It's expressed as a percentage and is a common way to report the accuracy of a measurement in science and engineering. For example, if a scientist measures the boiling point of water as 99°C, the percent error would compare this to the true value of 100°C.
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger>How is the Percent Error formula derived?</AccordionTrigger>
                                <AccordionContent>
                                    The formula is: `((Observed Value - True Value) / True Value) * 100%`. First, you find the difference between the observed and true values (the "error"). Then, you divide this error by the true value to see how significant the error is relative to the actual value. Finally, you multiply by 100 to express it as a percentage.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Can Percent Error be negative?</AccordionTrigger>
                                <AccordionContent>
                                    Yes. A negative percent error means your observed value is less than the true value. A positive percent error means your observed value is greater than the true value. The sign indicates the direction of the error. For this reason, sometimes the absolute value of the error is used to just show the magnitude of the error.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>What is the difference between Percent Error and Percent Difference?</AccordionTrigger>
                                <AccordionContent>
                                    Percent error is used when you are comparing a measured value to a known or "true" value. Percent difference is used when you are comparing two measured values to each other, and neither is considered the "true" value. For example, you would use percent difference to compare the results of two different experiments.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger>What is considered a "good" Percent Error?</AccordionTrigger>
                                <AccordionContent>
                                    The acceptability of a percent error depends entirely on the context. In high-precision fields like pharmaceuticals or aerospace engineering, a percent error of less than 1% might be required. In other fields, like a high-school chemistry experiment, an error of 5-10% might be acceptable.
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
