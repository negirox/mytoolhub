
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';


// Function to parse potentially fractional input
const parseValue = (input: string): number => {
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
    const precision = Math.max(1, Math.min(8, 8 - Math.floor(Math.log10(Math.abs(num)))));
    return num.toPrecision(precision).replace(/\.?0+$/, ""); 
};

export default function QuadraticFormulaCalculatorPage() {
    const [a, setA] = useState('1');
    const [b, setB] = useState('5');
    const [c, setC] = useState('4');

    const [solution, setSolution] = useState<string | null>(null);
    const [steps, setSteps] = useState<any>(null);
    const [graphData, setGraphData] = useState<any[]>([]);

    const calculate = () => {
        const valA = parseValue(a);
        const valB = parseValue(b);
        const valC = parseValue(c);

        if (isNaN(valA) || isNaN(valB) || isNaN(valC) || valA === 0) {
            setSolution('Invalid input. Ensure "a" is not zero.');
            setSteps(null);
            setGraphData([]);
            return;
        }

        const discriminant = valB * valB - 4 * valA * valC;
        let finalSolution;
        
        let currentSteps = {
            a: formatNumber(valA),
            b: formatNumber(valB),
            c: formatNumber(valC),
            discriminant: formatNumber(discriminant),
            sqrtDiscriminant: '',
            x1: '',
            x2: ''
        };

        if (discriminant > 0) {
            const sqrtD = Math.sqrt(discriminant);
            const x1 = (-valB + sqrtD) / (2 * valA);
            const x2 = (-valB - sqrtD) / (2 * valA);
            finalSolution = `x = ${formatNumber(x1)}, x = ${formatNumber(x2)}`;
            currentSteps.sqrtDiscriminant = formatNumber(sqrtD);
            currentSteps.x1 = formatNumber(x1);
            currentSteps.x2 = formatNumber(x2);
        } else if (discriminant === 0) {
            const x = -valB / (2 * valA);
            finalSolution = `x = ${formatNumber(x)}`;
            currentSteps.sqrtDiscriminant = '0';
            currentSteps.x1 = formatNumber(x);
        } else {
            const sqrtD = Math.sqrt(Math.abs(discriminant));
            const realPart = -valB / (2 * valA);
            const imaginaryPart = sqrtD / (2 * valA);
            finalSolution = `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`;
            currentSteps.sqrtDiscriminant = `${formatNumber(imaginaryPart)}i`;
            currentSteps.x1 = `${formatNumber(realPart)} + ${formatNumber(imaginaryPart)}i`;
            currentSteps.x2 = `${formatNumber(realPart)} - ${formatNumber(imaginaryPart)}i`;
        }
        
        setSolution(finalSolution);
        setSteps(currentSteps);

        // Generate data for graph
        const vertexX = -valB / (2 * valA);
        const data = [];
        for (let i = -10; i <= 10; i++) {
            const x = vertexX + i;
            const y = valA * x * x + valB * x + valC;
            data.push({ x: x.toFixed(2), y: y.toFixed(2) });
        }
        setGraphData(data);
    };

    return (
        <>
            <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
                <h1 className="font-headline text-xl font-semibold">Quadratic Formula Calculator</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Quadratic Equation Solver</CardTitle>
                            <CardDescription>
                                Solve equations of the form ax² + bx + c = 0. You can use fractional values like 3/4.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center text-lg md:text-xl font-semibold">
                                    <Input value={a} onChange={e => setA(e.target.value)} className="w-24 text-center" />
                                    <span>x² + </span>
                                    <Input value={b} onChange={e => setB(e.target.value)} className="w-24 text-center" />
                                    <span>x + </span>
                                    <Input value={c} onChange={e => setC(e.target.value)} className="w-24 text-center" />
                                    <span>= 0</span>
                                </div>
                                <Button onClick={calculate} className="w-full md:w-auto">Solve</Button>
                            </div>
                            
                            {solution && (
                                <Card className="mt-6 bg-muted/50">
                                    <CardHeader>
                                        <CardTitle>Solution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-primary break-all">{solution}</p>
                                    </CardContent>
                                </Card>
                            )}

                             {steps && (
                                <Card className="mt-4">
                                    <CardHeader>
                                        <CardTitle>Steps</CardTitle>
                                    </CardHeader>
                                    <CardContent className="font-mono text-sm space-y-4 break-words">
                                        <div className="flex items-center gap-2">
                                            <span>x = </span>
                                            <div className="flex flex-col items-center">
                                                <span>-b ± √b² - 4ac</span>
                                                <hr className="w-full border-foreground" />
                                                <span>2a</span>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <span>=</span>
                                            <div className="flex flex-col items-center">
                                                <span>-({steps.b}) ± √({steps.b})² - 4({steps.a})({steps.c})</span>
                                                <hr className="w-full border-foreground" />
                                                <span>2({steps.a})</span>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <span>=</span>
                                            <div className="flex flex-col items-center">
                                                <span>-{steps.b} ± √{steps.discriminant}</span>
                                                <hr className="w-full border-foreground" />
                                                <span>{2 * parseFloat(steps.a)}</span>
                                            </div>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <span>=</span>
                                            <div className="flex flex-col items-center">
                                                <span>-{steps.b} ± {steps.sqrtDiscriminant}</span>
                                                <hr className="w-full border-foreground" />
                                                <span>{2 * parseFloat(steps.a)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        </CardContent>
                    </Card>
                    
                    {graphData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Graph of the Equation</CardTitle>
                                <CardDescription>This graph shows the parabola for y = {a}x² + {b}x + {c}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{}} className="min-h-[400px] w-full">
                                    <LineChart
                                        data={graphData}
                                        margin={{
                                            top: 5, right: 30, left: 20, bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="x" label={{ value: 'x', position: 'insideBottomRight', offset: -5 }} />
                                        <YAxis label={{ value: 'y', angle: -90, position: 'insideLeft' }}/>
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <ReferenceLine y={0} stroke="#666" strokeDasharray="5 5" />
                                        <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}


                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What is a quadratic equation?</AccordionTrigger>
                                    <AccordionContent>
                                        A quadratic equation is a second-degree polynomial equation in a single variable x, with the general form ax² + bx + c = 0, where 'a', 'b', and 'c' are coefficients and 'a' is not equal to zero. Its graph is a parabola. For example, `x² - 4x + 4 = 0` is a quadratic equation.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>What is the quadratic formula?</AccordionTrigger>
                                    <AccordionContent>
                                        The quadratic formula is a formula that provides the solution(s) to a quadratic equation. It is: `x = [-b ± sqrt(b² - 4ac)] / 2a`. This formula can find the roots of any quadratic equation, regardless of whether they are real or complex.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>What is the 'discriminant'?</AccordionTrigger>
                                    <AccordionContent>
                                        The discriminant is the part of the quadratic formula under the square root sign: `b² - 4ac`. It is important because it tells you the nature of the roots:
                                        <ul className="list-disc pl-5 mt-2">
                                            <li>If the discriminant is **positive**, there are two distinct real roots.</li>
                                            <li>If the discriminant is **zero**, there is exactly one real root (a repeated root).</li>
                                            <li>If the discriminant is **negative**, there are two complex roots (conjugate pairs).</li>
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-4">
                                    <AccordionTrigger>Can the coefficients (a, b, c) be fractions or decimals?</AccordionTrigger>
                                    <AccordionContent>
                                        Yes. The coefficients can be any real numbers. This calculator supports both decimal inputs (e.g., 2.5) and fractional inputs (e.g., 3/4). The formula works exactly the same regardless of the type of number.
                                    </AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-5">
                                    <AccordionTrigger>What are some real-world applications of quadratic equations?</AccordionTrigger>
                                    <AccordionContent>
                                        Quadratic equations are used in many real-world situations, such as calculating the trajectory of a projectile (like a ball thrown in the air), determining the area of shapes, and optimizing problems in business and engineering to find maximum profit or minimum cost.
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
