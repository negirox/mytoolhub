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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CONVERSIONS = {
  length: {
    m: { name: 'Meter', to_base: 1 },
    km: { name: 'Kilometer', to_base: 1000 },
    cm: { name: 'Centimeter', to_base: 0.01 },
    mm: { name: 'Millimeter', to_base: 0.001 },
    mi: { name: 'Mile', to_base: 1609.34 },
    yd: { name: 'Yard', to_base: 0.9144 },
    ft: { name: 'Foot', to_base: 0.3048 },
    in: { name: 'Inch', to_base: 0.0254 },
  },
  weight: {
    kg: { name: 'Kilogram', to_base: 1 },
    g: { name: 'Gram', to_base: 0.001 },
    mg: { name: 'Milligram', to_base: 1e-6 },
    lb: { name: 'Pound', to_base: 0.453592 },
    oz: { name: 'Ounce', to_base: 0.0283495 },
  },
  temperature: {
    c: { name: 'Celsius' },
    f: { name: 'Fahrenheit' },
    k: { name: 'Kelvin' },
  },
};

type Category = keyof typeof CONVERSIONS;

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');

  const units = CONVERSIONS[category];

  const convertedValue = useMemo(() => {
    const inputNum = parseFloat(inputValue);
    if (isNaN(inputNum)) return '';

    if (category === 'temperature') {
        if (fromUnit === toUnit) return inputValue;
        if (fromUnit === 'c' && toUnit === 'f') return ((inputNum * 9/5) + 32).toFixed(2);
        if (fromUnit === 'f' && toUnit === 'c') return ((inputNum - 32) * 5/9).toFixed(2);
        if (fromUnit === 'c' && toUnit === 'k') return (inputNum + 273.15).toFixed(2);
        if (fromUnit === 'k' && toUnit === 'c') return (inputNum - 273.15).toFixed(2);
        if (fromUnit === 'f' && toUnit === 'k') return ((inputNum - 32) * 5/9 + 273.15).toFixed(2);
        if (fromUnit === 'k' && toUnit === 'f') return ((inputNum - 273.15) * 9/5 + 32).toFixed(2);
        return '';
    }

    const from = (units as any)[fromUnit];
    const to = (units as any)[toUnit];
    if (from && to) {
        const baseValue = inputNum * from.to_base;
        const result = baseValue / to.to_base;
        return result.toLocaleString(undefined, { maximumFractionDigits: 5 });
    }
    return '';
  }, [inputValue, fromUnit, toUnit, category, units]);
  
  const handleCategoryChange = (newCategory: string) => {
    const cat = newCategory as Category;
    setCategory(cat);
    const newUnits = Object.keys(CONVERSIONS[cat]);
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
    setInputValue('1');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
        <h1 className="font-headline text-xl font-semibold">Unit Converter</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Unit Converter</CardTitle>
            <CardDescription>
              Convert between different units of measurement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={category}
              onValueChange={handleCategoryChange}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="length">Length</TabsTrigger>
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="temperature">Temperature</TabsTrigger>
              </TabsList>
              <TabsContent value={category} className="mt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="from-value">From</Label>
                    <Input
                      id="from-value"
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(units).map(([unit, data]) => (
                          <SelectItem key={unit} value={unit}>
                            {(data as any).name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="flex flex-col gap-2">
                    <Label htmlFor="to-value">To</Label>
                    <Input id="to-value" value={convertedValue} readOnly />
                    <Select value={toUnit} onValueChange={setToUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(units).map(([unit, data]) => (
                          <SelectItem key={unit} value={unit}>
                            {(data as any).name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
