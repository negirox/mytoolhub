
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PercentageCalculatorPage() {
  const [activeTab, setActiveTab] = useState('whatIsXPercentOfY');

  // Tab 1 state
  const [val1, setVal1] = useState('15');
  const [val2, setVal2] = useState('150');
  
  // Tab 2 state
  const [val3, setVal3] = useState('20');
  const [val4, setVal4] = useState('200');

  // Tab 3 state
  const [val5, setVal5] = useState('100');
  const [val6, setVal6] = useState('125');


  const result1 = useMemo(() => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    if (isNaN(v1) || isNaN(v2)) return null;
    return (v1 / 100) * v2;
  }, [val1, val2]);
  
  const result2 = useMemo(() => {
    const v3 = parseFloat(val3);
    const v4 = parseFloat(val4);
    if (isNaN(v3) || isNaN(v4) || v4 === 0) return null;
    return (v3 / v4) * 100;
  }, [val3, val4]);

  const result3 = useMemo(() => {
    const v5 = parseFloat(val5);
    const v6 = parseFloat(val6);
    if (isNaN(v5) || isNaN(v6) || v5 === 0) return null;
    return ((v6 - v5) / v5) * 100;
  }, [val5, val6]);

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Percentage Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Percentage Calculator</CardTitle>
              <CardDescription>
                A versatile tool to handle all your percentage calculation needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                  <TabsTrigger value="whatIsXPercentOfY">What is X% of Y?</TabsTrigger>
                  <TabsTrigger value="xIsWhatPercentOfY">X is what % of Y?</TabsTrigger>
                  <TabsTrigger value="increaseDecrease">% Increase/Decrease</TabsTrigger>
                </TabsList>
                
                <TabsContent value="whatIsXPercentOfY" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Input type="number" value={val1} onChange={e => setVal1(e.target.value)} aria-label="Percentage"/>
                        <Label>% of</Label>
                        <Input type="number" value={val2} onChange={e => setVal2(e.target.value)} aria-label="Base value"/>
                    </div>
                     <div className="flex items-center justify-center text-2xl font-semibold">=</div>
                    <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{result1 !== null ? result1.toLocaleString() : '...'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="xIsWhatPercentOfY" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Input type="number" value={val3} onChange={e => setVal3(e.target.value)} aria-label="Part value" />
                        <Label>is what percent of</Label>
                        <Input type="number" value={val4} onChange={e => setVal4(e.target.value)} aria-label="Total value" />
                    </div>
                    <div className="flex items-center justify-center text-2xl font-semibold">=</div>
                     <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{result2 !== null ? `${result2.toLocaleString()}%` : '...'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="increaseDecrease" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Label>From</Label>
                        <Input type="number" value={val5} onChange={e => setVal5(e.target.value)} aria-label="Initial value" />
                        <Label>to</Label>
                        <Input type="number" value={val6} onChange={e => setVal6(e.target.value)} aria-label="Final value" />
                    </div>
                     <div className="flex items-center justify-center text-2xl font-semibold">=</div>
                     <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{result3 !== null ? `${result3.toLocaleString()}%` : '...'}</p>
                        {result3 !== null && <p className="text-sm text-muted-foreground">{result3 > 0 ? 'Increase' : 'Decrease'}</p>}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
