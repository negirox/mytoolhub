
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
        heightNumMeters = (feet * 12 + (inches || 0)) * 0.0254; // ft+in to meters
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
  
  const bmiNeedleRotation = useMemo(() => {
    if (!bmi) return -90; // Start at the beginning
    // The gauge is a semi-circle (180 degrees). We'll map BMI range 10-50 to -90deg to 90deg.
    const minBmi = 10;
    const maxBmi = 50;
    const value = Math.max(minBmi, Math.min(maxBmi, bmi));
    const percentage = (value - minBmi) / (maxBmi - minBmi);
    const rotation = -90 + (percentage * 180);
    return rotation;
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
                            <div className="relative w-full max-w-[300px] aspect-square">
                              <div className="absolute bottom-1/2 left-0 w-full h-1/2 overflow-hidden">
                                  <div
                                      className="absolute left-0 top-0 w-full h-[200%] rounded-full border-[30px] box-border"
                                      style={{
                                          borderBottomColor: '#f87171' /* red-400 */,
                                          borderLeftColor: '#facc15' /* yellow-400 */,
                                          borderRightColor: '#f87171' /* red-400 */,
                                          borderTopColor: '#34d399' /* green-400 */,
                                          transform: 'rotate(135deg)',
                                      }}
                                  ></div>
                                   <div
                                      className="absolute left-0 top-0 w-full h-[200%] rounded-full border-[30px] box-border"
                                      style={{
                                          borderBottomColor: 'transparent',
                                          borderLeftColor: 'transparent',
                                          borderRightColor: '#60a5fa' /* blue-400 */,
                                          borderTopColor: '#60a5fa' /* blue-400 */,
                                          transform: 'rotate(-45deg)',
                                      }}
                                  ></div>
                              </div>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-foreground z-10"></div>
                              <div
                                  className="absolute bottom-1/2 left-1/2 w-1 h-1/2 transition-transform duration-500 origin-bottom"
                                  style={{ transform: `translateX(-50%) rotate(${bmiNeedleRotation}deg)` }}
                              >
                                  <div className="w-full h-[80%] bg-foreground rounded-t-full"></div>
                              </div>
                              <div className="absolute bottom-[25%] text-center w-full">
                                  <p className="text-sm text-muted-foreground">Your BMI</p>
                                  <p className="text-4xl font-bold">{bmi.toFixed(1)}</p>
                                  <p className="text-lg font-semibold text-primary">({bmiCategory})</p>
                              </div>
                              
                              <div className="absolute w-full bottom-[45%] text-xs text-muted-foreground">
                                <span className="absolute left-0 -translate-x-1/2 transform -rotate-45">15</span>
                                <span className="absolute left-[15%] -translate-x-1/2 transform -rotate-45">18.5</span>
                                <span className="absolute left-1/2 -translate-x-1/2 transform">25</span>
                                <span className="absolute right-[15%] translate-x-1/2 transform rotate-45">30</span>
                                <span className="absolute right-0 translate-x-1/2 transform rotate-45">40</span>
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
  );
}
