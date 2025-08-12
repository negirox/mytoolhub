
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calculator, Percent, FlaskConical, Divide, Shuffle, Superscript, Cpu } from 'lucide-react';
import { Metadata } from 'next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

export const metadata: Metadata = {
    title: 'Math Calculators | MyToolHub',
    description: 'A collection of math calculators for various calculations like percentages, fractions, and more.'
};

const tools = [
  {
    title: 'Percentage Calculator',
    description: 'Calculate percentages for various scenarios.',
    href: '/dashboard/percentage-calculator',
    icon: <Percent className="size-8" />,
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-800 dark:text-purple-200',
    hoverBg: 'hover:bg-purple-200 dark:hover:bg-purple-900/80',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    title: 'Simple Calculator',
    description: 'A basic calculator for everyday arithmetic operations.',
    href: '/dashboard/simple-calculator',
    icon: <Calculator className="size-8" />,
    bgColor: 'bg-teal-100 dark:bg-teal-900/50',
    textColor: 'text-teal-800 dark:text-teal-200',
    hoverBg: 'hover:bg-teal-200 dark:hover:bg-teal-900/80',
    iconColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    title: 'Scientific Calculator',
    description: 'Perform advanced calculations with scientific functions.',
    href: '/dashboard/scientific-calculator',
    icon: <FlaskConical className="size-8" />,
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-800 dark:text-blue-200',
    hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/80',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Fraction Calculator',
    description: 'Add, subtract, multiply, and divide fractions easily.',
    href: '/dashboard/fraction-calculator',
    icon: <Divide className="size-8" />,
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    textColor: 'text-red-800 dark:text-red-200',
    hoverBg: 'hover:bg-red-200 dark:hover:bg-red-900/80',
    iconColor: 'text-red-600 dark:text-red-400'
  },
   {
    title: 'Random Number Generator',
    description: 'Generate random numbers with advanced options.',
    href: '/dashboard/random-number-generator',
    icon: <Shuffle className="size-8" />,
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    textColor: 'text-green-800 dark:text-green-200',
    hoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/80',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'Percent Error Calculator',
    description: 'Calculate the percent error between an observed and true value.',
    href: '/dashboard/percent-error-calculator',
    icon: <Percent className="size-8" />,
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    textColor: 'text-amber-800 dark:text-amber-200',
    hoverBg: 'hover:bg-amber-200 dark:hover:bg-amber-900/80',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
   {
    title: 'Exponent Calculator',
    description: 'Solve for base, exponent, or result with this versatile calculator.',
    href: '/dashboard/exponent-calculator',
    icon: <Superscript className="size-8" />,
    bgColor: 'bg-rose-100 dark:bg-rose-900/50',
    textColor: 'text-rose-800 dark:text-rose-200',
    hoverBg: 'hover:bg-rose-200 dark:hover:bg-rose-900/80',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  {
    title: 'Binary Calculator',
    description: 'Perform arithmetic and conversions with binary numbers.',
    href: '/dashboard/binary-calculator',
    icon: <Cpu className="size-8" />,
    bgColor: 'bg-slate-100 dark:bg-slate-900/50',
    textColor: 'text-slate-800 dark:text-slate-200',
    hoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-900/80',
    iconColor: 'text-slate-600 dark:text-slate-400'
  },
];

export default function MathCalculatorsPage() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Math Calculators</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
