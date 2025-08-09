
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type UnitSystem = 'metric' | 'imperial';
type Goal = 'maintenance' | 'fat_loss' | 'muscle_gain';

export default function ProteinCalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [age, setAge] = useState('30');
  const [weightKg, setWeightKg] = useState('70');
  const [weightLbs, setWeightLbs] = useState('155');
  const [goal, setGoal] = useState<Goal>('maintenance');

  const [results, setResults] = useState<{
    low: number;
    moderate: number;
    high: number;
  } | null>(null);

  const calculateProtein = () => {
    const ageNum = parseInt(age);
    const weightNumKg = unitSystem === 'metric' ? parseFloat(weightKg) : parseFloat(weightLbs) * 0.453592;

    if (isNaN(ageNum) || isNaN(weightNumKg) || ageNum <= 0 || weightNumKg <= 0) {
      setResults(null);
      return;
    }
    
    // Protein multipliers (grams per kg of body weight)
    const multipliers = {
        maintenance: { low: 1.2, moderate: 1.4, high: 1.6 },
        fat_loss: { low: 1.6, moderate: 1.8, high: 2.2 },
        muscle_gain: { low: 1.8, moderate: 2.0, high: 2.2 },
    };

    const selectedMultipliers = multipliers[goal];

    setResults({
      low: Math.round(weightNumKg * selectedMultipliers.low),
      moderate: Math.round(weightNumKg * selectedMultipliers.moderate),
      high: Math.round(weightNumKg * selectedMultipliers.high),
    });
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Low', value: results.low, label: `${results.low}g`, fill: 'hsl(var(--chart-3))' },
      { name: 'Moderate', value: results.moderate, label: `${results.moderate}g`, fill: 'hsl(var(--chart-2))' },
      { name: 'High', value: results.high, label: `${results.high}g`, fill: 'hsl(var(--chart-5))' },
    ];
  }, [results]);

  const chartConfig = {
    value: {
      label: 'Protein (grams)',
    },
  };


  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Protein Intake Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Daily Protein Intake Calculator</CardTitle>
              <CardDescription>
                Estimate your optimal daily protein intake based on your body weight and fitness goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Unit System</Label>
                        <Select value={unitSystem} onValueChange={(val) => setUnitSystem(val as UnitSystem)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                                <SelectItem value="metric">Metric (kg)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 30" />
                    </div>
                  </div>
                  
                  {unitSystem === 'metric' ? (
                      <div className="space-y-2">
                        <Label htmlFor="weight-kg">Weight (kg)</Label>
                        <Input id="weight-kg" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g., 70" />
                      </div>
                  ) : (
                      <div className="space-y-2">
                        <Label htmlFor="weight-lbs">Weight (pounds)</Label>
                        <Input id="weight-lbs" type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="e.g., 155" />
                      </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="goal">Primary Fitness Goal</Label>
                    <Select value={goal} onValueChange={(val) => setGoal(val as Goal)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="maintenance">Maintain Weight / General Health</SelectItem>
                            <SelectItem value="fat_loss">Fat Loss</SelectItem>
                            <SelectItem value="muscle_gain">Build Muscle</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={calculateProtein} className="w-full md:w-auto">Calculate</Button>
                </div>
                {results && (
                  <div className="flex flex-col items-center justify-center rounded-lg border p-4 md:p-6">
                    <h3 className="mb-4 text-center font-headline text-lg font-semibold">Your Estimated Daily Protein Range</h3>
                    <div className="w-full space-y-3 text-center">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Recommended Intake</p>
                        <p className="text-3xl font-bold text-primary">{results.moderate} grams/day</p>
                        <p className="text-xs text-muted-foreground">({results.low}g - {results.high}g)</p>
                      </div>
                      <p className="text-sm text-muted-foreground pt-4">
                        This is a recommended range. Athletes or individuals with very high activity levels may benefit from the higher end of the range, while less active individuals may need less.
                      </p>
                    </div>
                  </div>
                )}
              </div>
               {results && (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-headline">Protein Intake Comparison</CardTitle>
                      <CardDescription>A visual representation of low, moderate, and high protein intake levels for your goal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                         <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 40, top: 10, bottom: 10 }}>
                          <CartesianGrid horizontal={false} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} />
                          <XAxis type="number" hide />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="value" radius={5}>
                             <LabelList dataKey="label" position="right" offset={8} className="fill-foreground font-semibold" />
                          </Bar>
                        </BarChart>
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
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Why is protein important?</AccordionTrigger>
                        <AccordionContent>
                        Protein is a crucial macronutrient that plays a key role in building and repairing tissues, making enzymes and hormones, and supporting immune function. It's especially vital for muscle repair and growth after exercise.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How does my goal affect my protein needs?</AccordionTrigger>
                        <AccordionContent>
                         Your protein requirements change based on your goals. For muscle gain, you need more protein to provide the building blocks for new muscle tissue. During fat loss, a higher protein intake helps preserve muscle mass while you're in a calorie deficit and can increase satiety, making it easier to stick to your diet.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>What are good sources of protein?</AccordionTrigger>
                        <AccordionContent>
                        Good sources of protein include lean meats (chicken, turkey, beef), fish, eggs, dairy products (Greek yogurt, cottage cheese), legumes (beans, lentils), tofu, and protein supplements like whey or casein powder.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>Can I eat too much protein?</AccordionTrigger>
                        <AccordionContent>
                        For most healthy individuals, a high protein intake is generally safe. However, extremely high intakes over a long period might pose risks for individuals with pre-existing kidney conditions. It's always best to consume a balanced diet and consult with a healthcare professional if you have concerns.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>Is this calculator suitable for everyone?</AccordionTrigger>
                        <AccordionContent>
                        This calculator provides general recommendations for healthy adults. Pregnant or breastfeeding women, and individuals with medical conditions (especially kidney disease), should consult a doctor or registered dietitian for personalized advice.
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
