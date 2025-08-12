
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
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

export default function FatIntakeCalculatorPage() {
  const [dailyCalories, setDailyCalories] = useState('2000');
  const [fatPercentage, setFatPercentage] = useState('25');

  const [results, setResults] = useState<{
    grams: number;
    fatCalories: number;
    otherCalories: number;
  } | null>(null);

  const calculateFatIntake = () => {
    const calories = parseInt(dailyCalories);
    const percentage = parseInt(fatPercentage);

    if (isNaN(calories) || isNaN(percentage) || calories <= 0 || percentage <= 0) {
      setResults(null);
      return;
    }
    
    // There are 9 calories in one gram of fat.
    const fatCalories = calories * (percentage / 100);
    const fatGrams = fatCalories / 9;

    setResults({
      grams: Math.round(fatGrams),
      fatCalories: Math.round(fatCalories),
      otherCalories: Math.round(calories - fatCalories),
    });
  };

  const chartConfig = {
      fatCalories: { label: 'Fat Calories', color: 'hsl(var(--chart-5))' },
      otherCalories: { label: 'Other Calories (Protein & Carbs)', color: 'hsl(var(--chart-2))' }
  }

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
        { name: 'fatCalories', value: results.fatCalories, fill: 'var(--color-fatCalories)' },
        { name: 'otherCalories', value: results.otherCalories, fill: 'var(--color-otherCalories)' }
    ];
  }, [results]);


  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Fat Intake Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Daily Fat Intake Calculator</CardTitle>
              <CardDescription>
                Determine your recommended daily dietary fat intake based on your total calorie consumption.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Total Daily Calorie Intake</Label>
                    <Input id="calories" type="number" value={dailyCalories} onChange={(e) => setDailyCalories(e.target.value)} placeholder="e.g., 2000" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage of Calories from Fat (%)</Label>
                    <Input id="percentage" type="number" value={fatPercentage} onChange={(e) => setFatPercentage(e.target.value)} placeholder="e.g., 25" />
                     <p className="text-xs text-muted-foreground">Recommended: 20-35% for most adults.</p>
                  </div>
                  
                  <Button onClick={calculateFatIntake} className="w-full md:w-auto">Calculate</Button>
                </div>
                {results && (
                  <div className="flex flex-col items-center justify-center rounded-lg border p-4 md:p-6">
                    <h3 className="mb-4 text-center font-headline text-lg font-semibold">Your Recommended Daily Fat Intake</h3>
                    <div className="w-full space-y-3 text-center">
                      <div className="rounded-lg bg-muted/50 p-4">
                         <p className="text-3xl font-bold text-primary">{results.grams} grams/day</p>
                      </div>
                      <p className="text-sm text-muted-foreground pt-4">
                        This is equivalent to <span className="font-semibold text-orange-600 dark:text-orange-400">{results.fatCalories.toLocaleString()} calories</span> from fat per day. Focus on consuming healthy unsaturated fats.
                      </p>
                    </div>
                  </div>
                )}
              </div>
                {results && (
                 <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Calorie Breakdown</CardTitle>
                            <CardDescription>
                                This chart shows the proportion of your daily calories that come from fat versus other sources.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <ChartContainer config={chartConfig} className="min-h-[250px] w-full max-w-sm">
                                <PieChart accessibilityLayer>
                                    <ChartTooltip content={<ChartTooltipContent nameKey="name" formatter={(value, name) => `${chartConfig[name as keyof typeof chartConfig].label}: ${value}`} />} />
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <ChartLegend content={<ChartLegendContent formatter={(value) => chartConfig[value as keyof typeof chartConfig].label} />} />
                                </PieChart>
                            </ChartContainer>
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
                    <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Why is dietary fat important?</AccordionTrigger>
                        <AccordionContent>
                        Dietary fat is an essential macronutrient required for energy, vitamin absorption (A, D, E, K), hormone production, and protecting your organs. It's a vital part of a balanced diet. For example, healthy fats are crucial for brain health and reducing inflammation.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What's the difference between "good" and "bad" fats?</AccordionTrigger>
                        <AccordionContent>
                        <p><strong>"Good" fats</strong> are unsaturated (monounsaturated and polyunsaturated) fats found in foods like avocados, nuts, seeds, and olive oil. They can improve blood cholesterol levels and reduce the risk of heart disease.</p>
                        <p className="mt-2"><strong>"Bad" fats</strong> are saturated and trans fats, found in fatty meats, butter, and processed foods, which can raise bad cholesterol levels. It's best to limit these.</p>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What percentage of my calories should come from fat?</AccordionTrigger>
                        <AccordionContent>
                        Most dietary guidelines recommend that adults get 20% to 35% of their total daily calories from fat. For someone eating 2000 calories a day, this would be between 400 and 700 calories from fat, or about 44 to 78 grams.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>How many calories are in a gram of fat?</AccordionTrigger>
                        <AccordionContent>
                        Fat is the most energy-dense macronutrient, containing 9 calories per gram. This is more than double the calories in protein and carbohydrates, which each contain about 4 calories per gram. This is why high-fat foods are also high in calories.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Does eating fat make you fat?</AccordionTrigger>
                        <AccordionContent>
                        Eating fat does not automatically make you gain body fat. Weight gain is caused by consuming more total calories than your body burns, regardless of the source. Including healthy fats in your diet can actually help with satiety (feeling full) and weight management.
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
