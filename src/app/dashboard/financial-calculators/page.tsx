
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CreditCard, Home, Landmark, Percent } from 'lucide-react';
import { Metadata } from 'next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

export const metadata: Metadata = {
    title: 'Financial Calculators | MyToolHub',
    description: 'A collection of financial calculators to help you manage your money, from loan EMIs to taxes.'
};

const tools = [
  {
    title: 'EMI Calculator',
    description: 'Calculate your Equated Monthly Installment for any loan.',
    href: '/dashboard/emi-calculator',
    icon: <Landmark className="size-8" />,
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
    textColor: 'text-indigo-800 dark:text-indigo-200',
    hoverBg: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/80',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
   {
    title: 'Home Loan Calculator',
    description: 'Detailed home loan EMI and expense calculator.',
    href: '/dashboard/home-loan-emi-calculator',
    icon: <Home className="size-8" />,
    bgColor: 'bg-pink-100 dark:bg-pink-900/50',
    textColor: 'text-pink-800 dark:text-pink-200',
    hoverBg: 'hover:bg-pink-200 dark:hover:bg-pink-900/80',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
   {
    title: 'Credit Card EMI Calculator',
    description: 'Calculate credit card EMIs with processing fees and GST.',
    href: '/dashboard/credit-card-emi-calculator',
    icon: <CreditCard className="size-8" />,
    bgColor: 'bg-rose-100 dark:bg-rose-900/50',
    textColor: 'text-rose-800 dark:text-rose-200',
    hoverBg: 'hover:bg-rose-200 dark:hover:bg-rose-900/80',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  {
    title: 'Tax Calculator',
    description: 'A simple tax calculator for Indian tax regimes.',
    href: '/dashboard/tax-calculator',
    icon: <Percent className="size-8" />,
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/50',
    textColor: 'text-cyan-800 dark:text-cyan-200',
    hoverBg: 'hover:bg-cyan-200 dark:hover:bg-cyan-900/80',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  },
];

export default function FinancialCalculatorsPage() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Financial Calculators</h1>
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
