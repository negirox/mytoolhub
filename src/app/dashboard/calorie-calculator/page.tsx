
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
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';

export default function CalorieCalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('30');
  const [weightKg, setWeightKg] = useState('70');
  const [heightCm, setHeightCm] = useState('175');
  const [weightLbs, setWeightLbs] = useState('155');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('9');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('light');

  const [results, setResults] = useState<{
    maintenance: number;
    mildLoss: number;
    weightLoss: number;
    extremeLoss: number;
    mildGain: number;
    weightGain: number;
    fastGain: number;
  } | null>(null);

  const calculateCalories = () => {
    const ageNum = parseInt(age);
    const weightNum = unitSystem === 'metric' ? parseFloat(weightKg) : parseFloat(weightLbs) * 0.453592;
    const heightNum = unitSystem === 'metric' ? parseFloat(heightCm) : (parseFloat(heightFt) * 12 + parseFloat(heightIn)) * 2.54;

    if (isNaN(ageNum) || isNaN(weightNum) || isNaN(heightNum) || ageNum <= 0 || weightNum <= 0 || heightNum <= 0) {
      setResults(null);
      return;
    }

    let bmr = 0;
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra_active: 1.9,
    };

    const maintenanceCalories = bmr * activityMultipliers[activityLevel];
    
    setResults({
        maintenance: Math.round(maintenanceCalories),
        mildLoss: Math.round(maintenanceCalories - 250),
        weightLoss: Math.round(maintenanceCalories - 500),
        extremeLoss: Math.round(maintenanceCalories - 1000),
        mildGain: Math.round(maintenanceCalories + 250),
        weightGain: Math.round(maintenanceCalories + 500),
        fastGain: Math.round(maintenanceCalories + 1000),
    });
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Weight Loss', calories: results.weightLoss, fill: 'hsl(var(--chart-5))' },
      { name: 'Maintenance', calories: results.maintenance, fill: 'hsl(var(--chart-2))' },
      { name: 'Weight Gain', calories: results.weightGain, fill: 'hsl(var(--chart-1))' },
    ];
  }, [results]);

  const chartConfig = {
    calories: {
      label: 'Calories',
    },
  };

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Calorie Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Daily Calorie Calculator</CardTitle>
              <CardDescription>
                Estimate your daily calorie needs for maintenance, weight loss, or weight gain.
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
                                <SelectItem value="imperial">Imperial (lbs, ft, in)</SelectItem>
                                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={(val) => setGender(val as Gender)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 30" />
                  </div>
                  
                  {unitSystem === 'metric' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight-kg">Weight (kg)</Label>
                        <Input id="weight-kg" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g., 70" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height-cm">Height (cm)</Label>
                        <Input id="height-cm" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="e.g., 175" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="weight-lbs">Weight (pounds)</Label>
                            <Input id="weight-lbs" type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} placeholder="e.g., 155" />
                        </div>
                        <div className="space-y-2">
                            <Label>Height</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input id="height-ft" type="number" placeholder="feet" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
                                <Input id="height-in" type="number" placeholder="inches" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
                            </div>
                        </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="activity-level">Activity Level</Label>
                    <Select value={activityLevel} onValueChange={(val) => setActivityLevel(val as ActivityLevel)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                            <SelectItem value="light">Lightly Active (light exercise/sports 1-3 days/week)</SelectItem>
                            <SelectItem value="moderate">Moderately Active (moderate exercise/sports 3-5 days/week)</SelectItem>
                            <SelectItem value="active">Very Active (hard exercise/sports 6-7 days a week)</SelectItem>
                            <SelectItem value="extra_active">Extra Active (very hard exercise/sports & physical job)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={calculateCalories} className="w-full md:w-auto">Calculate</Button>
                </div>
                {results && (
                  <div className="flex flex-col items-center justify-center rounded-lg border p-4 md:p-6">
                    <h3 className="mb-4 text-center font-headline text-lg font-semibold">Your Estimated Daily Calorie Needs</h3>
                    <div className="w-full space-y-3">
                      <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                        <span className="font-semibold">Maintenance</span>
                        <span className="font-bold text-primary">{results.maintenance.toLocaleString()} Calories/day</span>
                      </div>
                       <div className="space-y-2 text-center pt-4">
                            <h4 className="font-semibold">Weight Loss Goals</h4>
                            <div className="flex justify-between p-2 text-sm">
                                <span>Mild weight loss (0.5 lb/week)</span>
                                <span>{results.mildLoss.toLocaleString()} Cal/day</span>
                            </div>
                            <div className="flex justify-between p-2 text-sm">
                                <span>Weight loss (1 lb/week)</span>
                                <span>{results.weightLoss.toLocaleString()} Cal/day</span>
                            </div>
                            <div className="flex justify-between p-2 text-sm">
                                <span>Extreme weight loss (2 lb/week)</span>
                                <span>{results.extremeLoss.toLocaleString()} Cal/day</span>
                            </div>
                       </div>
                       <div className="space-y-2 text-center">
                            <h4 className="font-semibold">Weight Gain Goals</h4>
                            <div className="flex justify-between p-2 text-sm">
                                <span>Mild weight gain (0.5 lb/week)</span>
                                <span>{results.mildGain.toLocaleString()} Cal/day</span>
                            </div>
                            <div className="flex justify-between p-2 text-sm">
                                <span>Weight gain (1 lb/week)</span>
                                <span>{results.weightGain.toLocaleString()} Cal/day</span>
                            </div>
                             <div className="flex justify-between p-2 text-sm">
                                <span>Fast weight gain (2 lb/week)</span>
                                <span>{results.fastGain.toLocaleString()} Cal/day</span>
                            </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
               {results && (
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-headline">Calorie Goals Overview</CardTitle>
                      <CardDescription>A visual comparison of daily calorie targets for different goals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20, right: 50 }}>
                          <CartesianGrid horizontal={false} />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} />
                          <XAxis type="number" hide />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                           <Bar dataKey="calories" radius={5}>
                             <LabelList
                                dataKey="calories"
                                position="right"
                                offset={8}
                                className="fill-foreground font-semibold"
                                formatter={(value: number) => value.toLocaleString()}
                            />
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
                        <AccordionTrigger>What is BMR?</AccordionTrigger>
                        <AccordionContent>
                        Basal Metabolic Rate (BMR) is the number of calories your body needs to accomplish its most basic (basal) life-sustaining functions, such as breathing, circulation, nutrient processing, and cell production. This calculator uses the Mifflin-St Jeor equation to estimate your BMR.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>How does activity level affect calorie needs?</AccordionTrigger>
                        <AccordionContent>
                        Your BMR is multiplied by an activity factor to estimate your total daily energy expenditure (TDEE), or maintenance calories. The more active you are, the higher your activity multiplier, and the more calories you need to consume to maintain your current weight.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>What is a calorie deficit for weight loss?</AccordionTrigger>
                        <AccordionContent>
                        To lose weight, you need to consume fewer calories than your body burns. This is called a calorie deficit. A deficit of 500 calories per day typically leads to about 1 pound (0.45 kg) of weight loss per week.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4">
                        <AccordionTrigger>What is a calorie surplus for weight gain?</AccordionTrigger>
                        <AccordionContent>
                        To gain weight (primarily muscle, with proper training), you need to consume more calories than your body burns. This is a calorie surplus. A surplus of 250-500 calories per day is a common recommendation for steady weight gain.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5">
                        <AccordionTrigger>Are these calculations 100% accurate?</AccordionTrigger>
                        <AccordionContent>
                        No, these are estimations. Calorie calculators provide a good starting point, but individual metabolisms can vary. It's best to use this as a guideline, monitor your weight over a few weeks, and adjust your calorie intake as needed based on your results.
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
