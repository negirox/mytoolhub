
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calculator, EggFried, Percent, Scale } from 'lucide-react';
import { Metadata } from 'next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

export const metadata: Metadata = {
    title: 'Health & Fitness Calculators | MyToolHub',
    description: 'A collection of health and fitness calculators to help you track your progress and stay healthy.'
};

const tools = [
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index to assess your weight status.',
    href: '/dashboard/bmi-calculator',
    icon: <Scale className="size-8" />,
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-800 dark:text-blue-200',
    hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/80',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Calorie Calculator',
    description: 'Estimate your daily calorie needs for maintenance, fat loss, or muscle gain.',
    href: '/dashboard/calorie-calculator',
    icon: <Calculator className="size-8" />,
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    textColor: 'text-green-800 dark:text-green-200',
    hoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/80',
    iconColor: 'text-green-600 dark:text-green-400'
  },
   {
    title: 'Protein Calculator',
    description: 'Calculate your optimal daily protein intake based on your goals.',
    href: '/dashboard/protein-calculator',
    icon: <EggFried className="size-8" />,
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    hoverBg: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/80',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
   {
    title: 'Fat Intake Calculator',
    description: 'Determine your recommended daily fat intake for a balanced diet.',
    href: '/dashboard/fat-intake-calculator',
    icon: <Percent className="size-8" />,
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-800 dark:text-purple-200',
    hoverBg: 'hover:bg-purple-200 dark:hover:bg-purple-900/80',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
];

export default function HealthAndFitnessPage() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Health & Fitness Calculators</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Tooltip key={tool.href}>
                <TooltipTrigger asChild>
                  <Link href={tool.href} className="h-full">
                    <Card className={`flex flex-col h-full transition-all duration-300 hover:scale-105 ${tool.bgColor} ${tool.hoverBg}`}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`font-headline text-lg ${tool.textColor}`}>
                          {tool.title}
                        </CardTitle>
                        <div className={`${tool.iconColor} animate-breathe`}>{tool.icon}</div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className={`text-sm ${tool.textColor} opacity-80`}>
                          {tool.description}
                        </p>
                      </CardContent>
                      <div className="flex items-center p-6 pt-0">
                        <Button>
                          Go to tool <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to use the {tool.title}. {tool.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
      </main>
    </TooltipProvider>
  );
}
