
'use client';

import { useState, useMemo } from 'react';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Bed, Sunrise, Sunset } from 'lucide-react';

// export const metadata: Metadata = {
//   title: 'Sleep Calculator',
//   description: 'Calculate the best time to wake up or go to bed based on your natural 90-minute sleep cycles. Improve your sleep quality and wake up feeling refreshed.',
// };

const TIME_TO_FALL_ASLEEP = 15; // minutes
const SLEEP_CYCLE_DURATION = 90; // minutes

export default function SleepCalculatorPage() {
  const [activeTab, setActiveTab] = useState('wake-up');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [bedTimes, setBedTimes] = useState<string[]>([]);
  const [wakeUpTimes, setWakeUpTimes] = useState<string[]>([]);

  const calculateBedTimes = () => {
    const [hours, minutes] = wakeUpTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        setBedTimes([]);
        return;
    }
    const wakeUpDate = new Date();
    wakeUpDate.setHours(hours, minutes, 0, 0);

    const newBedTimes = Array.from({ length: 6 }, (_, i) => {
        const cycles = 6 - i;
        const totalSleepMinutes = cycles * SLEEP_CYCLE_DURATION + TIME_TO_FALL_ASLEEP;
        const bedTime = new Date(wakeUpDate.getTime() - totalSleepMinutes * 60 * 1000);
        return {
            time: bedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cycles: cycles,
            duration: `${Math.floor(cycles * SLEEP_CYCLE_DURATION / 60)}h ${cycles * SLEEP_CYCLE_DURATION % 60}m`
        }
    });

    setBedTimes(newBedTimes.map(bt => `For ${bt.cycles} cycles (${bt.duration}), go to bed at: ${bt.time}`));
  };
  
  const calculateWakeUpTimes = () => {
    const now = new Date();
    const bedTime = new Date(now.getTime() + TIME_TO_FALL_ASLEEP * 60 * 1000);

    const newWakeUpTimes = Array.from({ length: 6 }, (_, i) => {
        const cycles = 6 - i;
        const totalSleepMinutes = cycles * SLEEP_CYCLE_DURATION;
        const wakeUpTime = new Date(bedTime.getTime() + totalSleepMinutes * 60 * 1000);
         return {
            time: wakeUpTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cycles: cycles,
            duration: `${Math.floor(totalSleepMinutes / 60)}h ${totalSleepMinutes % 60}m`
        }
    });

    setWakeUpTimes(newWakeUpTimes.map(wt => `For ${wt.cycles} cycles (${wt.duration}), wake up at: ${wt.time}`));
  }

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Sleep Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card className="bg-gradient-to-br from-indigo-50 via-background to-background dark:from-indigo-900/20">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-primary">Sleep Cycle Calculator</CardTitle>
              <CardDescription>
                Calculate your ideal bedtime or wake-up time based on natural 90-minute sleep cycles to wake up feeling refreshed and energized.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-lg mx-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="wake-up">I want to wake up at...</TabsTrigger>
                        <TabsTrigger value="bedtime">If I go to bed now...</TabsTrigger>
                    </TabsList>
                    <TabsContent value="wake-up" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sunrise className="text-yellow-500" /> Wake-Up Time</CardTitle>
                                <CardDescription>Enter the time you need to wake up, and we'll suggest the best times to go to sleep.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wake-up-time">I need to wake up at:</Label>
                                    <Input id="wake-up-time" type="time" value={wakeUpTime} onChange={e => setWakeUpTime(e.target.value)} className="max-w-xs" />
                                </div>
                                <Button onClick={calculateBedTimes} className="w-full md:w-auto">Calculate Bedtimes</Button>
                                {bedTimes.length > 0 && (
                                    <div className="pt-4 space-y-2">
                                        <h3 className="font-semibold text-lg">Recommended Bedtimes:</h3>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {bedTimes.map((time, index) => (
                                                <li key={index} className="p-3 rounded-md bg-muted text-sm">{time}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="bedtime" className="mt-4">
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sunset className="text-orange-500"/> Bedtime</CardTitle>
                                <CardDescription>If you go to bed right now, here are the best times to wake up.</CardDescription>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                <p className="text-muted-foreground">Assuming you fall asleep in about 15 minutes, you should aim to wake up at one of the following times:</p>
                                <Button onClick={calculateWakeUpTimes} className="w-full md:w-auto">Calculate Wake-Up Times</Button>
                                 {wakeUpTimes.length > 0 && (
                                    <div className="pt-4 space-y-2">
                                        <h3 className="font-semibold text-lg">Recommended Wake-Up Times:</h3>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {wakeUpTimes.map((time, index) => (
                                                <li key={index} className="p-3 rounded-md bg-muted text-sm">{time}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle className="font-headline">Frequently Asked Questions (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What is a sleep cycle?</AccordionTrigger>
                        <AccordionContent>
                        A sleep cycle is the progression through several stages of sleep, from light sleep to deep sleep and finally REM (Rapid Eye Movement) sleep. One full cycle typically lasts about 90 minutes. Waking up at the end of a sleep cycle, rather than in the middle of one, can help you feel more rested and less groggy.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>How many sleep cycles do I need?</AccordionTrigger>
                        <AccordionContent>
                        Most adults need 7-9 hours of sleep per night, which corresponds to about 5-6 full sleep cycles. This calculator provides options for different numbers of cycles so you can choose based on your schedule and needs.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3" className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Why does the calculator add 15 minutes?</AccordionTrigger>
                        <AccordionContent>
                        On average, it takes a person about 15 minutes to fall asleep. The calculator adds this time to its bedtime calculations to ensure you're actually asleep for the full duration of the cycles. This leads to more accurate wake-up times for feeling refreshed.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-4" className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>What if I wake up in the middle of the night?</AccordionTrigger>
                        <AccordionContent>
                        Waking up briefly during the night is normal. As long as you can fall back asleep relatively quickly, it shouldn't significantly disrupt your overall sleep architecture. The key is to aim for a consistent total sleep time that allows for 5-6 complete cycles.
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-5" className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 mb-2">
                        <AccordionTrigger>Is this calculator a substitute for medical advice?</AccordionTrigger>
                        <AccordionContent>
                        No. This calculator is an educational tool based on general sleep science principles. It is not a substitute for professional medical advice. If you have persistent sleep problems, such as insomnia or sleep apnea, please consult a doctor or a sleep specialist.
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
