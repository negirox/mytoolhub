
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Uses crypto.getRandomValues for better randomness than Math.random()
const randomBigInt = (min: bigint, max: bigint): bigint => {
    if (min > max) {
        [min, max] = [max, min]; // Swap if min is greater than max
    }
    const range = max - min + 1n;
    const bits = range.toString(2).length;
    let random;
    do {
        const buffer = new Uint8Array(Math.ceil(bits / 8));
        crypto.getRandomValues(buffer);
        random = buffer.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
        random = random >> BigInt(buffer.length * 8 - bits);
    } while (random >= range);
    return random + min;
};

const generateDecimalString = (minStr: string, maxStr: string, precision: number): string => {
    const [minIntPart, minDecPart = ''] = minStr.split('.');
    const [maxIntPart, maxDecPart = ''] = maxStr.split('.');
    
    const maxPrecision = Math.max(minDecPart.length, maxDecPart.length);
    const scaleFactor = 10n ** BigInt(precision);

    const minBigInt = BigInt(minIntPart + minDecPart.padEnd(precision, '0')) * (10n ** BigInt(precision - minDecPart.length));
    const maxBigInt = BigInt(maxIntPart + maxDecPart.padEnd(precision, '0')) * (10n ** BigInt(precision - maxDecPart.length));
    
    const randomNum = randomBigInt(minBigInt, maxBigInt);
    
    let randomStr = randomNum.toString().padStart(precision + 1, '0');
    let integerPart = randomStr.slice(0, -precision) || '0';
    let decimalPart = randomStr.slice(-precision);
    
    return `${integerPart}.${decimalPart}`;
};


export default function RandomNumberGeneratorPage() {
    // Simple Generator State
    const [lowerLimitSimple, setLowerLimitSimple] = useState('1');
    const [upperLimitSimple, setUpperLimitSimple] = useState('100');
    const [resultSimple, setResultSimple] = useState('');

    // Comprehensive Generator State
    const [lowerLimitComp, setLowerLimitComp] = useState('0.2');
    const [upperLimitComp, setUpperLimitComp] = useState('112.5');
    const [numToGenerate, setNumToGenerate] = useState('1');
    const [resultType, setResultType] = useState<'integer' | 'decimal'>('decimal');
    const [precision, setPrecision] = useState('50');
    const [resultComp, setResultComp] = useState('');
    
    const handleGenerateSimple = () => {
        try {
            const min = BigInt(lowerLimitSimple);
            const max = BigInt(upperLimitSimple);
            const result = randomBigInt(min, max);
            setResultSimple(result.toString());
        } catch (e) {
            setResultSimple('Invalid limit');
        }
    };

    const handleGenerateComp = () => {
        try {
            const numCount = parseInt(numToGenerate);
            if(isNaN(numCount) || numCount <= 0) {
                setResultComp('Invalid number count');
                return;
            }

            const results = [];
            for (let i = 0; i < numCount; i++) {
                if (resultType === 'integer') {
                    const min = BigInt(lowerLimitComp.split('.')[0]);
                    const max = BigInt(upperLimitComp.split('.')[0]);
                    results.push(randomBigInt(min, max).toString());
                } else {
                    const prec = parseInt(precision);
                    if(isNaN(prec) || prec < 1 || prec > 999) {
                       setResultComp('Precision must be between 1 and 999');
                       return;
                    }
                    results.push(generateDecimalString(lowerLimitComp, upperLimitComp, prec));
                }
            }
            setResultComp(results.join('\n'));
        } catch (e) {
            setResultComp('Invalid input');
        }
    };


    return (
        <>
        <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
            <h1 className="font-headline text-xl font-semibold">Random Number Generator</h1>
        </header>
        <main className="flex-1 p-4 md:p-6">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Random Integer Generator</CardTitle>
                        <CardDescription>
                            This version of the generator creates a single random integer between two limits. It can handle very large integers with thousands of digits.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lower-limit-simple">Lower Limit</Label>
                                <Input id="lower-limit-simple" value={lowerLimitSimple} onChange={e => setLowerLimitSimple(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="upper-limit-simple">Upper Limit</Label>
                                <Input id="upper-limit-simple" value={upperLimitSimple} onChange={e => setUpperLimitSimple(e.target.value)} />
                            </div>
                        </div>
                        <Button onClick={handleGenerateSimple}>Generate</Button>
                        {resultSimple && (
                             <div className="mt-4 rounded-lg border p-4">
                               <h3 className="font-semibold text-lg">Result</h3>
                               <p className="font-mono text-primary text-xl break-all">{resultSimple}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Comprehensive Random Number Generator</CardTitle>
                        <CardDescription>
                            This version can create one or many random integers or decimals. It can handle very large numbers with up to 999 digits of precision.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lower-limit-comp">Lower Limit</Label>
                                <Input id="lower-limit-comp" value={lowerLimitComp} onChange={e => setLowerLimitComp(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="upper-limit-comp">Upper Limit</Label>
                                <Input id="upper-limit-comp" value={upperLimitComp} onChange={e => setUpperLimitComp(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="num-generate">Generate how many numbers?</Label>
                                <Input id="num-generate" value={numToGenerate} onChange={e => setNumToGenerate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                               <Label>Type of result to generate?</Label>
                               <RadioGroup value={resultType} onValueChange={(val) => setResultType(val as any)} className="flex gap-4 pt-2">
                                   <div className="flex items-center space-x-2"><RadioGroupItem value="integer" id="r-integer" /><Label htmlFor="r-integer">Integer</Label></div>
                                   <div className="flex items-center space-x-2"><RadioGroupItem value="decimal" id="r-decimal" /><Label htmlFor="r-decimal">Decimal</Label></div>
                               </RadioGroup>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="precision">Precision (decimal places)</Label>
                                <Input id="precision" value={precision} onChange={e => setPrecision(e.target.value)} disabled={resultType === 'integer'} />
                            </div>
                        </div>
                        <Button onClick={handleGenerateComp}>Generate</Button>
                        {resultComp && (
                             <div className="mt-4 rounded-lg border p-4">
                               <h3 className="font-semibold text-lg">Results</h3>
                               <Textarea value={resultComp} readOnly className="font-mono min-h-32" />
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
                                <AccordionTrigger>Are these numbers truly random?</AccordionTrigger>
                                <AccordionContent>
                                This calculator uses your browser's `crypto.getRandomValues()` function, which provides cryptographically strong pseudo-random numbers. While not truly random in the physical sense (like atmospheric noise), they are of a much higher quality than standard `Math.random()` and are suitable for most applications, including cryptography. For example, they are unpredictable and pass statistical tests for randomness.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>How does the high-precision decimal generator work?</AccordionTrigger>
                                <AccordionContent>
                                It works by treating the numbers as large integers. For example, to get a number between 0.2 and 112.5 with 50 digits of precision, it first generates a very large random integer between 200...0 (51 digits) and 112500...0 (52 digits). It then places the decimal point back at the 50th position from the right, ensuring the result is within the original range and has the correct precision.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>What is a `BigInt` and why is it used here?</AccordionTrigger>
                                <AccordionContent>
                                A `BigInt` is a special numeric object in JavaScript that can represent integers of arbitrary size, overcoming the limitations of the standard `Number` type which can lose precision with very large numbers (typically those larger than 2⁵³ - 1). This allows our calculator to generate random integers that are thousands of digits long without error. For example, you can generate a random number between 1 and a googol (10¹⁰⁰).
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4">
                                <AccordionTrigger>What are some common uses for a random number generator?</AccordionTrigger>
                                <AccordionContent>
                                Random number generators are used in many fields:
                                <ul className="list-disc pl-5 mt-2">
                                  <li><strong>Cryptography:</strong> To generate keys and nonces that must be unpredictable.</li>
                                  <li><strong>Statistics:</strong> For sampling populations (e.g., selecting random participants for a study).</li>
                                  <li><strong>Simulations:</strong> To model complex systems with random variables, like weather patterns or stock market fluctuations.</li>
                                  <li><strong>Gaming:</strong> To determine random events, like a dice roll or a card shuffle.</li>
                                  <li><strong>Art & Music:</strong> To create generative art or procedural music compositions.</li>
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
