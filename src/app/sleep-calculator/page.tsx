
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Bed, Sunrise, Moon, Star } from 'lucide-react';

const TIME_TO_FALL_ASLEEP = 15; // minutes
const SLEEP_CYCLE_DURATION = 90; // minutes

export default function SleepCalculatorPage() {
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

    setBedTimes(newBedTimes.map(bt => `To get ${bt.cycles} sleep cycles (${bt.duration}), go to bed at ${bt.time}.`));
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
          <Card className="bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
            <CardHeader className="text-center items-center py-10">
                 <div className="flex items-center gap-4">
                    <Moon className="size-12 text-yellow-300 animate-pulse" />
                    <CardTitle className="font-headline text-5xl tracking-tighter">Sleep Calculator</CardTitle>
                    <div className="flex flex-col">
                        <Star className="size-4 text-yellow-300 animate-ping" />
                        <Star className="size-3 text-yellow-300 animate-pulse" />
                    </div>
                </div>
              <CardDescription className="text-indigo-200 max-w-xl">
                Wake up between sleep cycles and feel refreshed. Enter your desired wake-up time or calculate from now to find your optimal sleep schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Wake Up At Section */}
                    <div className="space-y-4 rounded-lg bg-black/20 p-6">
                         <h2 className="text-xl font-semibold text-center">What time do you want to wake up?</h2>
                         <div className="space-y-2">
                             <Label htmlFor="wake-up-time" className="sr-only">Wake up time</Label>
                             <Input id="wake-up-time" type="time" value={wakeUpTime} onChange={e => setWakeUpTime(e.target.value)} className="bg-slate-800 border-indigo-600 text-white w-full" />
                         </div>
                         <Button onClick={calculateBedTimes} className="w-full bg-yellow-300 text-slate-900 hover:bg-yellow-400">
                             <Bed className="mr-2" /> Calculate Bedtime
                         </Button>
                         {bedTimes.length > 0 && (
                            <div className="pt-4 space-y-2">
                                <h3 className="font-semibold">You should go to bed at one of the following times:</h3>
                                <ul className="space-y-1 text-sm">
                                    {bedTimes.map((time, index) => (
                                        <li key={index} className="p-2 rounded-md bg-indigo-900/50">{time}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                    </div>
                    {/* Go to Bed Now Section */}
                    <div className="space-y-4 rounded-lg bg-black/20 p-6 flex flex-col justify-between">
                         <h2 className="text-xl font-semibold text-center">If you want to go to bed now...</h2>
                         <p className="text-center text-indigo-300 text-sm flex-grow">Click below to find the best times to set your alarm, assuming you fall asleep in about 15 minutes.</p>
                         <Button onClick={calculateWakeUpTimes} className="w-full bg-yellow-300 text-slate-900 hover:bg-yellow-400">
                            <Sunrise className="mr-2"/> Calculate Wake-up Time
                         </Button>
                         {wakeUpTimes.length > 0 && (
                            <div className="pt-4 space-y-2">
                                <h3 className="font-semibold">You should wake up at one of the following times:</h3>
                                <ul className="space-y-1 text-sm">
                                    {wakeUpTimes.map((time, index) => (
                                        <li key={index} className="p-2 rounded-md bg-indigo-900/50">{time}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                    </div>
                </div>
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
