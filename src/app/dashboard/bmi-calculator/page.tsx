
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UnitSystem = 'metric' | 'imperial';

const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obesity';
};

const getBmiColor = (bmi: number) => {
    if (bmi < 18.5) return 'hsl(var(--chart-4))'; // yellow
    if (bmi < 25) return 'hsl(var(--chart-2))'; // green
    if (bmi < 30) return 'hsl(var(--chart-5))'; // orange
    return 'hsl(var(--chart-1))'; // red
};


export default function BmiCalculatorPage() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('imperial');

  // Metric state
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // Imperial state
  const [weightLbs, setWeightLbs] = useState('160');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('10');
  
  // Other inputs
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');


  // Results
  const [bmi, setBmi] = useState<number | null>(null);
  const [healthyWeightRange, setHealthyWeightRange] = useState<[number, number] | null>(null);
  const [bmiPrime, setBmiPrime] = useState<number | null>(null);
  const [ponderalIndex, setPonderalIndex] = useState<number | null>(null);

  const calculateBmi = () => {
    let weightNum = 0;
    let heightNumMeters = 0;

    if (unitSystem === 'metric') {
      const weight = parseFloat(weightKg);
      const height = parseFloat(heightCm);
      if (weight > 0 && height > 0) {
        weightNum = weight;
        heightNumMeters = height / 100;
      }
    } else {
      const weight = parseFloat(weightLbs);
      const feet = parseFloat(heightFt);
      const inches = parseFloat(heightIn);
      if (weight > 0 && (feet > 0 || inches > 0)) {
        weightNum = weight * 0.453592; // lbs to kg
        heightNumMeters = ((feet || 0) * 12 + (inches || 0)) * 0.0254; // ft+in to meters
      }
    }

    if (weightNum > 0 && heightNumMeters > 0) {
      const bmiValue = weightNum / (heightNumMeters * heightNumMeters);
      setBmi(bmiValue);
      setBmiPrime(bmiValue / 25);
      setPonderalIndex(weightNum / (heightNumMeters * heightNumMeters * heightNumMeters));

      const lowerBmi = 18.5;
      const upperBmi = 25;
      const lowerWeight = lowerBmi * (heightNumMeters * heightNumMeters);
      const upperWeight = upperBmi * (heightNumMeters * heightNumMeters);
      
      if (unitSystem === 'metric') {
        setHealthyWeightRange([lowerWeight, upperWeight]);
      } else {
        setHealthyWeightRange([lowerWeight / 0.453592, upperWeight / 0.453592]); // kg to lbs
      }

    } else {
      setBmi(null);
      setHealthyWeightRange(null);
      setBmiPrime(null);
      setPonderalIndex(null);
    }
  };
  
  const bmiCategory = useMemo(() => (bmi ? getBmiCategory(bmi) : ''), [bmi]);
  const bmiColor = useMemo(() => (bmi ? getBmiColor(bmi) : 'transparent'), [bmi]);
  
  const bmiMarkerPosition = useMemo(() => {
    if (!bmi) return 0;
    const minBmi = 15;
    const maxBmi = 40;
    const value = Math.max(minBmi, Math.min(maxBmi, bmi));
    const percentage = ((value - minBmi) / (maxBmi - minBmi)) * 100;
    return percentage;
  }, [bmi]);
  

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">BMI Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Body Mass Index (BMI) Calculator
              </CardTitle>
              <CardDescription>
                Use this calculator to check your body mass index (BMI) and find out if you are a healthy weight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={unitSystem} onValueChange={(val) => setUnitSystem(val as UnitSystem)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm">
                    <TabsTrigger value="imperial">US Units</TabsTrigger>
                    <TabsTrigger value="metric">Metric Units</TabsTrigger>
                </TabsList>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 25" />
                                <span className="text-xs text-muted-foreground">Ages: 2 - 120</span>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <TabsContent value="metric" className="m-0">
                             <div className="space-y-2">
                                <Label htmlFor="height-cm">Height (cm)</Label>
                                <Input
                                    id="height-cm"
                                    type="number"
                                    placeholder="e.g., 175"
                                    value={heightCm}
                                    onChange={(e) => setHeightCm(e.target.value)}
                                />
                            </div>
                             <div className="space-y-2 mt-4">
                                <Label htmlFor="weight-kg">Weight (kg)</Label>
                                <Input
                                    id="weight-kg"
                                    type="number"
                                    placeholder="e.g., 70"
                                    value={weightKg}
                                    onChange={(e) => setWeightKg(e.target.value)}
                                />
                            </div>
                        </TabsContent>
                         <TabsContent value="imperial" className="m-0">
                           <div className="space-y-2">
                              <Label>Height</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  id="height-ft"
                                  type="number"
                                  placeholder="feet"
                                  value={heightFt}
                                  onChange={(e) => setHeightFt(e.target.value)}
                                  aria-label="Height in feet"
                                />
                                <Input
                                  id="height-in"
                                  type="number"
                                  placeholder="inches"
                                  value={heightIn}
                                  onChange={(e) => setHeightIn(e.target.value)}
                                  aria-label="Height in inches"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <Label htmlFor="weight-lbs">Weight (pounds)</Label>
                                <Input
                                    id="weight-lbs"
                                    type="number"
                                    placeholder="e.g., 160"
                                    value={weightLbs}
                                    onChange={(e) => setWeightLbs(e.target.value)}
                                />
                            </div>
                        </TabsContent>
                        <Button onClick={calculateBmi} className="mt-4 w-full md:w-auto transition-all">
                            Calculate BMI
                        </Button>
                    </div>
                     {bmi !== null && (
                         <div className="flex flex-col items-center justify-center rounded-lg border p-4 md:p-6">
                            <h3 className="text-lg font-semibold mb-4">Your Result</h3>
                            <div className="text-center mb-4">
                                <p className="text-4xl font-bold" style={{color: bmiColor}}>{bmi.toFixed(1)}</p>
                                <p className="text-lg font-semibold" style={{color: bmiColor}}>({bmiCategory})</p>
                            </div>
                            <div className="text-sm text-center w-full space-y-2">
                                <p>Healthy BMI range: <span className="font-semibold">18.5 kg/m² - 25 kg/m²</span></p>
                                {healthyWeightRange && (
                                    <p>Healthy weight for the height: <span className="font-semibold">{healthyWeightRange[0].toFixed(1)} {unitSystem === 'metric' ? 'kgs' : 'lbs'} - {healthyWeightRange[1].toFixed(1)} {unitSystem === 'metric' ? 'kgs' : 'lbs'}</span></p>
                                )}
                                {bmiPrime && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className='underline-dashed'>BMI Prime: <span className="font-semibold">{bmiPrime.toFixed(2)}</span></p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className='max-w-xs'>BMI Prime is the ratio of actual BMI to the upper limit of normal BMI (25). A value > 1.0 is overweight.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {ponderalIndex && (
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                            <p className='underline-dashed'>Ponderal Index: <span className="font-semibold">{ponderalIndex.toFixed(1)} kg/m³</span></p>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                             <p className='max-w-xs'>The Ponderal Index is a measure of leanness. It is similar to BMI but is considered more accurate for very tall or short individuals.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                 {bmi !== null && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="font-headline">BMI Scale</CardTitle>
                            <CardDescription>This scale shows where your BMI falls on the spectrum from underweight to obesity.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pt-4">
                            <div className="w-full max-w-xl">
                                <div className="relative h-6 w-full rounded-full flex overflow-hidden">
                                    <div className="w-[14%] bg-[hsl(var(--chart-4))]" /> 
                                    <div className="w-[26%] bg-[hsl(var(--chart-2))]" />
                                    <div className="w-[20%] bg-[hsl(var(--chart-5))]" />
                                    <div className="w-[40%] bg-[hsl(var(--chart-1))]" />
                                    <div
                                        className="absolute top-0 h-full w-1.5 -translate-x-1/2 transform rounded-full bg-foreground border-2 border-background"
                                        style={{ left: `${bmiMarkerPosition}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">{bmi.toFixed(1)}</div>
                                    </div>
                                </div>
                                <div className="relative mt-2 flex w-full text-xs text-muted-foreground">
                                    <div className="w-[14%] text-center">Underweight</div>
                                    <div className="w-[26%] text-center">Normal</div>
                                    <div className="w-[20%] text-center">Overweight</div>
                                    <div className="w-[40%] text-center">Obesity</div>
                                </div>
                                 <div className="relative mt-1 flex w-full text-xs text-muted-foreground">
                                    <span className="absolute" style={{left: `0%`}}>15</span>
                                    <span className="absolute" style={{left: `14%`, transform: 'translateX(-50%)'}}>18.5</span>
                                    <span className="absolute" style={{left: `40%`, transform: 'translateX(-50%)'}}>25</span>
                                    <span className="absolute" style={{left: `60%`, transform: 'translateX(-50%)'}}>30</span>
                                    <span className="absolute" style={{left: `100%`, transform: 'translateX(-100%)'}}>40</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
              </Tabs>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Body Mass Index (BMI)?</AccordionTrigger>
                  <AccordionContent>
                    Body Mass Index (BMI) is a measure that uses your height and weight to work out if your weight is healthy. The BMI calculation divides an adult's weight in kilograms by their height in metres squared. It is the most widely used measure for assessing weight status.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How is BMI interpreted for adults?</AccordionTrigger>
                  <AccordionContent>
                    For most adults, an ideal BMI is in the 18.5 to 24.9 range. A BMI below 18.5 is considered underweight. A BMI between 25 and 29.9 is considered overweight, and a BMI of 30 or above is considered obese.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is BMI accurate for everyone?</AccordionTrigger>
                  <AccordionContent>
                    While BMI is a useful screening tool, it does not tell the whole story. It does not distinguish between fat and muscle mass, which is denser. Therefore, very muscular individuals, like athletes, may have a high BMI without having excess body fat. It's also not the best measure for children, teenagers, pregnant women, or the elderly.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>What are the limitations of using BMI?</AccordionTrigger>
                  <AccordionContent>
                    The main limitations are that it doesn't account for body composition (fat vs. muscle), body fat distribution, or ethnic differences in body composition. It should be used as one part of a larger health assessment, alongside other measures like waist circumference, blood pressure, and cholesterol levels.
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                  <AccordionTrigger>How can I achieve a healthy BMI?</AccordionTrigger>
                  <AccordionContent>
                    Achieving a healthy BMI involves a balanced diet and regular physical activity. Focus on eating a variety of nutrient-dense foods, controlling portion sizes, and reducing your intake of processed foods, sugary drinks, and unhealthy fats. Combine this with regular exercise, including both aerobic activities and strength training.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
           </Card>
        </div>
      </main>
    </TooltipProvider>
  );
}
