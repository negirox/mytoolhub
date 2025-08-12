
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const LN2 = Math.log(2); // Natural log of 2, approx 0.693

export default function HalfLifeCalculatorPage() {
    // Main calculator state
    const [initialQty, setInitialQty] = useState('100');
    const [remainingQty, setRemainingQty] = useState('');
    const [time, setTime] = useState('50');
    const [halfLife, setHalfLife] = useState('10');
    const [lastChanged, setLastChanged] = useState<'N0' | 'Nt' | 't' | 't12'>('t12');

    // Conversion calculator state
    const [convHalfLife, setConvHalfLife] = useState('10');
    const [convMeanLifetime, setConvMeanLifetime] = useState('');
    const [convDecayConstant, setConvDecayConstant] = useState('');
    const [lastConvChanged, setLastConvChanged] = useState<'t12' | 'tau' | 'lambda'>('t12');
    
    // Main calculation effect
    useEffect(() => {
        const N0 = parseFloat(initialQty);
        const Nt = parseFloat(remainingQty);
        const t = parseFloat(time);
        const t12 = parseFloat(halfLife);

        if (lastChanged !== 'Nt' && !isNaN(N0) && !isNaN(t) && !isNaN(t12) && N0 > 0 && t12 > 0) {
            const result = N0 * Math.pow(0.5, t / t12);
            setRemainingQty(result.toPrecision(8));
        } else if (lastChanged !== 'N0' && !isNaN(Nt) && !isNaN(t) && !isNaN(t12) && Nt > 0 && t12 > 0) {
            const result = Nt / Math.pow(0.5, t / t12);
            setInitialQty(result.toPrecision(8));
        } else if (lastChanged !== 't' && !isNaN(N0) && !isNaN(Nt) && !isNaN(t12) && N0 > 0 && Nt > 0 && N0 >= Nt && t12 > 0) {
            const result = t12 * Math.log(Nt / N0) / Math.log(0.5);
            setTime(result.toPrecision(8));
        } else if (lastChanged !== 't12' && !isNaN(N0) && !isNaN(Nt) && !isNaN(t) && N0 > 0 && Nt > 0 && N0 >= Nt && t > 0) {
            const result = t * Math.log(0.5) / Math.log(Nt / N0);
            setHalfLife(result.toPrecision(8));
        }

    }, [initialQty, remainingQty, time, halfLife, lastChanged]);
    
    // Conversion calculation effect
    useEffect(() => {
        if (lastConvChanged === 't12') {
            const t12 = parseFloat(convHalfLife);
            if (!isNaN(t12) && t12 > 0) {
                setConvMeanLifetime((t12 / LN2).toPrecision(8));
                setConvDecayConstant((LN2 / t12).toPrecision(8));
            } else {
                 setConvMeanLifetime('');
                 setConvDecayConstant('');
            }
        } else if (lastConvChanged === 'tau') {
            const tau = parseFloat(convMeanLifetime);
            if (!isNaN(tau) && tau > 0) {
                setConvHalfLife((tau * LN2).toPrecision(8));
                setConvDecayConstant((1 / tau).toPrecision(8));
            } else {
                setConvHalfLife('');
                setConvDecayConstant('');
            }
        } else if (lastConvChanged === 'lambda') {
            const lambda = parseFloat(convDecayConstant);
            if (!isNaN(lambda) && lambda > 0) {
                setConvHalfLife((LN2 / lambda).toPrecision(8));
                setConvMeanLifetime((1 / lambda).toPrecision(8));
            } else {
                setConvHalfLife('');
                setConvMeanLifetime('');
            }
        }
    }, [convHalfLife, convMeanLifetime, convDecayConstant, lastConvChanged]);


    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Half-Life Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Half-Life Decay Calculator</CardTitle>
                            <CardDescription>
                                This tool can calculate any one of the values from the other three in the half-life formula: N(t) = N₀ * (1/2)^(t/T). Enter any three values to solve for the fourth.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="initial-qty">Initial Quantity (N₀)</Label>
                                    <Input id="initial-qty" type="number" value={initialQty} onChange={e => { setInitialQty(e.target.value); setLastChanged('N0'); }} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remaining-qty">Quantity Remains (N(t))</Label>
                                    <Input id="remaining-qty" type="number" value={remainingQty} onChange={e => { setRemainingQty(e.target.value); setLastChanged('Nt'); }} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Time Elapsed (t)</Label>
                                    <Input id="time" type="number" value={time} onChange={e => { setTime(e.target.value); setLastChanged('t'); }} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="half-life">Half-Life (T)</Label>
                                    <Input id="half-life" type="number" value={halfLife} onChange={e => { setHalfLife(e.target.value); setLastChanged('t12'); }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Half-Life, Mean Lifetime, & Decay Constant</CardTitle>
                            <CardDescription>
                                Enter any one value to convert between half-life, mean lifetime (τ), and the decay constant (λ).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
                                <div className="space-y-2">
                                    <Label htmlFor="conv-half-life">Half-Life (t₁/₂)</Label>
                                    <Input id="conv-half-life" type="number" value={convHalfLife} onChange={e => { setConvHalfLife(e.target.value); setLastConvChanged('t12'); }} />
                                </div>
                                <div className="text-2xl font-bold">=</div>
                                <div className="space-y-2">
                                    <Label htmlFor="conv-mean-lifetime">Mean Lifetime (τ)</Label>
                                    <Input id="conv-mean-lifetime" type="number" value={convMeanLifetime} onChange={e => { setConvMeanLifetime(e.target.value); setLastConvChanged('tau'); }} />
                                </div>
                                 <div className="text-2xl font-bold hidden md:block">=</div>
                                 <div className="space-y-2 md:col-start-3">
                                    <Label htmlFor="conv-decay-constant">Decay Constant (λ)</Label>
                                    <Input id="conv-decay-constant" type="number" value={convDecayConstant} onChange={e => { setConvDecayConstant(e.target.value); setLastConvChanged('lambda'); }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What is half-life?</AccordionTrigger>
                                    <AccordionContent>
                                        Half-life is the time required for a quantity of a substance to reduce to half of its initial value. The term is most commonly used in the context of radioactive decay, but it can also be used to describe any type of exponential decay, such as the clearance of a drug from the body. For example, the half-life of Carbon-14 is about 5,730 years, which is why it's used for radiocarbon dating of ancient artifacts.
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-2">
                                    <AccordionTrigger>What is the half-life formula?</AccordionTrigger>
                                    <AccordionContent>
                                        The formula for exponential decay is: `N(t) = N₀ * (1/2)^(t/T)`, where:
                                        <ul className="list-disc pl-5 mt-2">
                                            <li>`N(t)` is the quantity of the substance remaining after time `t`.</li>
                                            <li>`N₀` is the initial quantity of the substance.</li>
                                            <li>`t` is the time elapsed.</li>
                                            <li>`T` is the half-life of the substance.</li>
                                        </ul>
                                        This calculator can solve for any of these four variables if the other three are provided.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What is the Decay Constant (λ)?</AccordionTrigger>
                                    <AccordionContent>
                                        The decay constant (lambda, λ) is a parameter that represents the probability per unit time that a single nucleus will decay. It is inversely proportional to the half-life. The relationship is `λ = ln(2) / T`, where `ln(2)` is the natural logarithm of 2 (approximately 0.693). A larger decay constant means a faster decay.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>What is the Mean Lifetime (τ)?</AccordionTrigger>
                                    <AccordionContent>
                                        The mean lifetime (tau, τ) is the average lifetime of a decaying particle before it decays. It is the reciprocal of the decay constant (`τ = 1/λ`). The relationship between mean lifetime and half-life is `τ = T / ln(2)`. The mean lifetime is always longer than the half-life by a factor of about 1.44.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-5">
                                    <AccordionTrigger>What are some real-world applications of half-life?</AccordionTrigger>
                                    <AccordionContent>
                                        Half-life is a critical concept in many fields:
                                        <ul className="list-disc pl-5 mt-2">
                                            <li><strong>Archaeology:</strong> Carbon-14 dating uses the known half-life of carbon to determine the age of organic materials.</li>
                                            <li><strong>Medicine:</strong> The half-life of a drug determines how long it stays in the body and helps doctors decide on appropriate dosage schedules. For example, a drug with a short half-life may need to be taken more frequently.</li>
                                            <li><strong>Nuclear Physics:</strong> It is fundamental to understanding radioactive decay, managing nuclear waste, and ensuring safety in nuclear power plants.</li>
                                        </ul>
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
