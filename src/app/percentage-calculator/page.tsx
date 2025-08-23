
'use client';

import { useState, useMemo } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function PercentageCalculatorPage() {
  // Main Calculator State
  const [mainPercent, setMainPercent] = useState('15');
  const [mainOf, setMainOf] = useState('150');
  const [mainResult, setMainResult] = useState('');

  // Common Phrases State
  const [phrase1Percent, setPhrase1Percent] = useState('10');
  const [phrase1Of, setPhrase1Of] = useState('200');
  const [phrase2Is, setPhrase2Is] = useState('20');
  const [phrase2Of, setPhrase2Of] = useState('200');
  const [phrase3Is, setPhrase3Is] = useState('50');
  const [phrase3Percent, setPhrase3Percent] = useState('25');

  // Difference Calculator State
  const [diffVal1, setDiffVal1] = useState('100');
  const [diffVal2, setDiffVal2] = useState('120');
  
  // Change Calculator State
  const [changeVal1, setChangeVal1] = useState('100');
  const [changeVal2, setChangeVal2] = useState('125');

  // Main Calculator Logic
  useMemo(() => {
    const p = parseFloat(mainPercent);
    const o = parseFloat(mainOf);
    if (!isNaN(p) && !isNaN(o)) {
      setMainResult(((p / 100) * o).toLocaleString());
    } else {
      setMainResult('');
    }
  }, [mainPercent, mainOf]);
  
  // Common Phrases Logic
  const phrase1Result = useMemo(() => ((parseFloat(phrase1Percent) / 100) * parseFloat(phrase1Of) || 0).toLocaleString(), [phrase1Percent, phrase1Of]);
  const phrase2Result = useMemo(() => ((parseFloat(phrase2Is) / parseFloat(phrase2Of)) * 100 || 0).toLocaleString(), [phrase2Is, phrase2Of]);
  const phrase3Result = useMemo(() => (parseFloat(phrase3Is) / (parseFloat(phrase3Percent) / 100) || 0).toLocaleString(), [phrase3Is, phrase3Percent]);

  // Difference Logic
  const diffResult = useMemo(() => {
    const v1 = parseFloat(diffVal1);
    const v2 = parseFloat(diffVal2);
    if (isNaN(v1) || isNaN(v2) || (v1 + v2) === 0) return 0;
    return (Math.abs(v1 - v2) / ((v1 + v2) / 2)) * 100;
  }, [diffVal1, diffVal2]);
  
  // Change Logic
  const changeResult = useMemo(() => {
    const v1 = parseFloat(changeVal1);
    const v2 = parseFloat(changeVal2);
    if (isNaN(v1) || isNaN(v2) || v1 === 0) return 0;
    return ((v2 - v1) / v1) * 100;
  }, [changeVal1, changeVal2]);


  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Percentage Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Versatile Percentage Calculator</CardTitle>
              <CardDescription>
                This calculator automatically solves for the third value when you provide any two.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center text-center">
                 <div className="space-y-1">
                    <Input type="number" value={mainPercent} onChange={e => setMainPercent(e.target.value)} className="text-center"/>
                 </div>
                 <Label className="font-semibold text-lg">% of</Label>
                 <div className="space-y-1">
                    <Input type="number" value={mainOf} onChange={e => setMainOf(e.target.value)} className="text-center" />
                 </div>
                 <Label className="font-semibold text-lg">=</Label>
                  <div className="space-y-1">
                    <Input type="number" value={mainResult} onChange={e => setMainResult(e.target.value)} className="text-center font-bold text-primary" />
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
                <CardTitle className="font-headline">Percentage Calculator in Common Phrases</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_1fr_auto_1fr] gap-2 items-center rounded-lg border p-4">
                    <Label className="font-medium">What is</Label>
                    <Input type="number" value={phrase1Percent} onChange={e => setPhrase1Percent(e.target.value)} className="w-24 text-center"/>
                    <Label className="font-medium">% of</Label>
                    <Input type="number" value={phrase1Of} onChange={e => setPhrase1Of(e.target.value)} className="w-24 text-center"/>
                    <Label className="font-medium text-lg">=</Label>
                    <div className="font-bold text-primary text-xl">{phrase1Result}</div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center rounded-lg border p-4">
                    <Input type="number" value={phrase2Is} onChange={e => setPhrase2Is(e.target.value)} className="w-24 text-center"/>
                    <Label className="font-medium">is what % of</Label>
                    <Input type="number" value={phrase2Of} onChange={e => setPhrase2Of(e.target.value)} className="w-24 text-center"/>
                    <Label className="font-medium text-lg">=</Label>
                    <div className="font-bold text-primary text-xl">{phrase2Result}%</div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-2 items-center rounded-lg border p-4">
                    <Input type="number" value={phrase3Is} onChange={e => setPhrase3Is(e.target.value)} className="w-24 text-center"/>
                    <Label className="font-medium">is</Label>
                    <Input type="number" value={phrase3Percent} onChange={e => setPhrase3Percent(e.target.value)} className="w-24 text-center"/>
                    <Label className="font-medium">% of what</Label>
                     <Label className="font-medium text-lg">=</Label>
                    <div className="font-bold text-primary text-xl">{phrase3Result}</div>
                </div>
             </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Percentage Difference</CardTitle>
                    <CardDescription>Calculate the percentage difference between two numbers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="diff-v1">Value 1</Label>
                            <Input id="diff-v1" type="number" value={diffVal1} onChange={e => setDiffVal1(e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="diff-v2">Value 2</Label>
                            <Input id="diff-v2" type="number" value={diffVal2} onChange={e => setDiffVal2(e.target.value)} />
                        </div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Difference</p>
                        <p className="text-2xl font-bold text-primary">{diffResult.toFixed(2)}%</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Percentage Change</CardTitle>
                    <CardDescription>Calculate increase or decrease from an initial value.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="change-v1">From</Label>
                            <Input id="change-v1" type="number" value={changeVal1} onChange={e => setChangeVal1(e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="change-v2">To</Label>
                            <Input id="change-v2" type="number" value={changeVal2} onChange={e => setChangeVal2(e.target.value)} />
                        </div>
                    </div>
                     <div className="rounded-lg border p-4 text-center">
                        <p className="text-sm text-muted-foreground">Change</p>
                        <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${changeResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {changeResult >= 0 ? <ArrowUp className="size-5"/> : <ArrowDown className="size-5"/>}
                           {Math.abs(changeResult).toFixed(2)}%
                        </p>
                    </div>
                </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What is the basic formula for a percentage?</AccordionTrigger>
                        <AccordionContent>
                        The basic formula is: (Part / Whole) * 100 = Percentage. This calculator helps you solve for any of these three values (part, whole, or percentage) easily.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How is Percentage Change calculated?</AccordionTrigger>
                        <AccordionContent>
                        Percentage Change is calculated using the formula: ((New Value - Old Value) / Old Value) * 100. A positive result indicates a percentage increase, while a negative result indicates a decrease.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>What's the difference between Percentage Change and Percentage Difference?</AccordionTrigger>
                        <AccordionContent>
                        Percentage Change measures the change from a specific starting point (the "old" value). Percentage Difference, on the other hand, measures the difference between two values relative to their average, without considering one as the starting point. It shows how different the two values are from each other.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>When would I use the Percentage Difference calculator?</AccordionTrigger>
                        <AccordionContent>
                        You would use the percentage difference when you want to compare two values without a specific "before and after" context. For example, comparing the prices of two similar products, or comparing the test scores of two different students.
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
