
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
import { cn } from '@/lib/utils';

type UnitSystem = 'metric' | 'imperial';

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
  const [bmiCategory, setBmiCategory] = useState('');
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
        heightNumMeters = (feet * 12 + inches) * 0.0254; // ft+in to meters
      }
    }

    if (weightNum > 0 && heightNumMeters > 0) {
      const bmiValue = weightNum / (heightNumMeters * heightNumMeters);
      setBmi(bmiValue);
      setBmiPrime(bmiValue / 25);
      setPonderalIndex(weightNum / (heightNumMeters * heightNumMeters * heightNumMeters));

      if (bmiValue < 18.5) {
        setBmiCategory('Underweight');
      } else if (bmiValue < 25) {
        setBmiCategory('Normal');
      } else if (bmiValue < 30) {
        setBmiCategory('Overweight');
      } else {
        setBmiCategory('Obesity');
      }
      
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
      setBmiCategory('');
      setHealthyWeightRange(null);
      setBmiPrime(null);
      setPonderalIndex(null);
    }
  };
  
  const bmiGaugePosition = useMemo(() => {
    if (!bmi) return '0%';
    let percentage = 0;
    if (bmi < 16) percentage = ((bmi - 10) / 6) * 12.5; // Starts at 10 for gauging
    else if (bmi < 18.5) percentage = 12.5 + ((bmi - 16) / 2.5) * 25;
    else if (bmi < 25) percentage = 37.5 + ((bmi - 18.5) / 6.5) * 25;
    else if (bmi < 30) percentage = 62.5 + ((bmi - 25) / 5) * 12.5;
    else if (bmi < 40) percentage = 75 + ((bmi-30)/10) * 25;
    else percentage = 100;
    return `${Math.max(0, Math.min(100, percentage))}%`;
  }, [bmi]);

  return (
    <>
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
                <div className="grid gap-6 mt-4 md:grid-cols-2">
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
                        <Button onClick={calculateBmi} className="mt-4 w-full md:w-auto">
                            Calculate BMI
                        </Button>
                    </div>
                     {bmi !== null && (
                        <div className="flex flex-col items-center justify-center rounded-lg border p-6">
                            <h3 className="font-headline text-lg font-semibold mb-2">
                                Your BMI is: {bmi.toFixed(1)} kg/m²
                            </h3>
                            <p className="text-xl font-bold text-primary mb-4">
                                ({bmiCategory})
                            </p>
                            
                            <div className="w-full">
                                <div className="relative h-8 w-full rounded-full overflow-hidden flex">
                                    <div className="w-[37.5%] bg-blue-400" />
                                    <div className="w-[25%] bg-green-500" />
                                    <div className="w-[12.5%] bg-yellow-400" />
                                    <div className="w-[25%] bg-red-500" />
                                </div>
                                <div className="relative w-full h-4 -mt-6">
                                    <div className="absolute top-1/2 -translate-y-1/2 transform transition-all duration-500" style={{ left: bmiGaugePosition }}>
                                        <div className="w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg" />
                                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 text-xs font-semibold whitespace-nowrap">BMI = {bmi.toFixed(1)}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground mt-4 px-1">
                                    <span>16</span>
                                    <span>18.5</span>
                                    <span>25</span>
                                    <span>30</span>
                                    <span>40</span>
                                </div>
                            </div>
                            
                            <div className="mt-8 text-sm text-center w-full space-y-2">
                                <p>Healthy BMI range: <span className="font-semibold">18.5 kg/m² - 25 kg/m²</span></p>
                                {healthyWeightRange && (
                                    <p>Healthy weight for the height: <span className="font-semibold">{healthyWeightRange[0].toFixed(1)} {unitSystem === 'metric' ? 'kgs' : 'lbs'} - {healthyWeightRange[1].toFixed(1)} {unitSystem === 'metric' ? 'kgs' : 'lbs'}</span></p>
                                )}
                                {bmiPrime && (
                                    <p>BMI Prime: <span className="font-semibold">{bmiPrime.toFixed(2)}</span></p>
                                )}
                                {ponderalIndex && (
                                    <p>Ponderal Index: <span className="font-semibold">{ponderalIndex.toFixed(1)} kg/m³</span></p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
    
  