
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

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
  area: {
    sqm: { name: 'Square Meter', to_base: 1 },
    sqkm: { name: 'Square Kilometer', to_base: 1e6 },
    sqcm: { name: 'Square Centimeter', to_base: 1e-4 },
    ha: { name: 'Hectare', to_base: 10000 },
    sqft: { name: 'Square Foot', to_base: 0.092903 },
    ac: { name: 'Acre', to_base: 4046.86 },
  },
  volume: {
    cbm: { name: 'Cubic Meter', to_base: 1 },
    L: { name: 'Liter', to_base: 0.001 },
    mL: { name: 'Milliliter', to_base: 1e-6 },
    gal: { name: 'Gallon (US)', to_base: 0.00378541 },
    cbft: { name: 'Cubic Foot', to_base: 0.0283168 },
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
      if (fromUnit === 'c' && toUnit === 'f')
        return ((inputNum * 9) / 5 + 32).toFixed(2);
      if (fromUnit === 'f' && toUnit === 'c')
        return (((inputNum - 32) * 5) / 9).toFixed(2);
      if (fromUnit === 'c' && toUnit === 'k')
        return (inputNum + 273.15).toFixed(2);
      if (fromUnit === 'k' && toUnit === 'c')
        return (inputNum - 273.15).toFixed(2);
      if (fromUnit === 'f' && toUnit === 'k')
        return (((inputNum - 32) * 5) / 9 + 273.15).toFixed(2);
      if (fromUnit === 'k' && toUnit === 'f')
        return (((inputNum - 273.15) * 9) / 5 + 32).toFixed(2);
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

  const chartData = useMemo(() => {
    const fromLabel = (units as any)[fromUnit]?.name || fromUnit;
    const toLabel = (units as any)[toUnit]?.name || toUnit;
    const fromValue = parseFloat(inputValue) || 0;
    const toValue = parseFloat(convertedValue.replace(/,/g, '')) || 0;
    
    if (fromValue === 0 && toValue === 0) return [];

    return [
      { name: fromLabel, value: fromValue },
      { name: toLabel, value: toValue },
    ];
  }, [inputValue, convertedValue, fromUnit, toUnit, units]);

  const chartConfig = {
    value: {
      label: 'Value',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Unit Converter</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
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
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                  <TabsTrigger value="length">Length</TabsTrigger>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="temperature">Temperature</TabsTrigger>
                  <TabsTrigger value="area">Area</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
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

          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Visual Representation
                </CardTitle>
                <CardDescription>
                  A quick comparison of the converted values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                  <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{left: 20}}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                    <XAxis type="number" hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Frequently Asked Questions (FAQ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Why do we need unit converters?</AccordionTrigger>
                  <AccordionContent>
                    Unit converters are essential tools for scientists, engineers, students, and anyone who needs to work with measurements from different systems. They eliminate manual calculation errors and save time, especially when dealing with complex conversions in fields like international trade, cooking, or scientific research.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What is the difference between Imperial and Metric systems?</AccordionTrigger>
                  <AccordionContent>
                    The Metric system (used by most of the world) is a decimal-based system where units are related by powers of 10 (e.g., 100 centimeters in a meter). The Imperial system (used primarily in the United States) has units with less uniform relationships (e.g., 12 inches in a foot, 3 feet in a yard).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do you convert temperature?</AccordionTrigger>
                  <AccordionContent>
                    Temperature conversion is unique because it involves an offset, not just a scaling factor. For example, to convert Celsius to Fahrenheit, you multiply by 9/5 and then add 32. Kelvin is an absolute scale starting at absolute zero, so its conversion to Celsius is a simple addition or subtraction of 273.15.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What is a 'base unit' in conversions?</AccordionTrigger>
                  <AccordionContent>
                    In many conversion systems, a 'base unit' is a standard unit for a particular measurement category. For example, the meter is the base unit for length in the International System of Units (SI). Our converter first converts the 'from' value to a common base unit and then converts that base value to the 'to' unit for accuracy.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>How is area converted?</AccordionTrigger>
                  <AccordionContent>
                    Area is a measure of two-dimensional space. When converting area units, the conversion factor is squared. For instance, since 1 foot = 0.3048 meters, 1 square foot = (0.3048)^2 = 0.0929 square meters.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>How is volume converted?</AccordionTrigger>
                  <AccordionContent>
                    Volume measures three-dimensional space. Similar to area, the conversion factor for length is cubed. For example, if 1 foot = 0.3048 meters, then 1 cubic foot = (0.3048)^3 = 0.0283 cubic meters.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-7">
                  <AccordionTrigger>What are some common length conversions?</AccordionTrigger>
                  <AccordionContent>
                    Some common length conversions include inches to centimeters (1 in = 2.54 cm), miles to kilometers (1 mi = 1.609 km), and feet to meters (1 ft = 0.3048 m). These are frequently used in travel, construction, and everyday measurements.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-8">
                  <AccordionTrigger>What are some common weight conversions?</AccordionTrigger>
                  <AccordionContent>
                    Common weight (mass) conversions include pounds to kilograms (1 lb = 0.453 kg) and ounces to grams (1 oz = 28.35 g). These are essential for cooking, shipping, and scientific applications.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-9">
                  <AccordionTrigger>Can I convert between units of different types, like length to weight?</AccordionTrigger>
                  <AccordionContent>
                    No, you cannot directly convert between units of different physical quantities (e.g., length and weight). Unit conversion only works for units within the same category, such as meters to feet (both length) or kilograms to pounds (both weight).
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-10">
                  <AccordionTrigger>Why are there different gallons (e.g., US vs. Imperial)?</AccordionTrigger>
                  <AccordionContent>
                    Historical reasons led to the development of different measurement systems. The US gallon and the Imperial (UK) gallon, for example, were both defined centuries ago but were standardized to different volumes. The US gallon is smaller (about 3.785 liters) than the Imperial gallon (about 4.546 liters).
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

