
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calculator, CreditCard, EggFried, Home, Landmark, Percent, Ruler, Scale, Wallet } from 'lucide-react';
import { Clock } from '@/components/ui/clock';
import { Metadata } from 'next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';


export const metadata: Metadata = {
    title: 'Dashboard | MyToolHub',
    description: 'Unlock a suite of powerful, free online calculators and converters designed for your everyday needs. From health and fitness to finance and general utility, all our tools are fast, secure, and operate entirely on your device for maximum privacy.'
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
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    textColor: 'text-red-800 dark:text-red-200',
    hoverBg: 'hover:bg-red-200 dark:hover:bg-red-900/80',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    title: 'Currency Converter',
    description: 'Convert between different currencies with real-time rates.',
    href: '/dashboard/currency-converter',
    icon: <Wallet className="size-8" />,
    bgColor: 'bg-teal-100 dark:bg-teal-900/50',
    textColor: 'text-teal-800 dark:text-teal-200',
    hoverBg: 'hover:bg-teal-200 dark:hover:bg-teal-900/80',
    iconColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    title: 'Unit Converter',
    description: 'Convert length, weight, area, volume, and more.',
    href: '/dashboard/unit-converter',
    icon: <Ruler className="size-8" />,
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    textColor: 'text-orange-800 dark:text-orange-200',
    hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-900/80',
    iconColor: 'text-orange-600 dark:text-orange-400'
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

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Dashboard</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Welcome to Your All-in-One Tool Hub
              </CardTitle>
              <CardDescription>
                Unlock a suite of powerful, free online calculators and converters designed for your everyday needs. From health and fitness to finance and general utility, all our tools are fast, secure, and operate entirely on your device for maximum privacy.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <p>
                  Whether you're calculating your BMI for health tracking, planning your finances with our detailed EMI and loan calculators, or converting units on the fly, MyToolHub has you covered. Each tool is crafted to be intuitive, mobile-friendly, and completely private—all calculations happen on your device. Explore our collection below and stay tuned as we continuously expand our toolkit!
                </p>
              </div>
              <div className="flex-shrink-0">
                <Clock />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Tooltip key={tool.href}>
                <TooltipTrigger asChild>
                  <Link href={tool.href} className="h-full">
                    <Card className={`flex flex-col h-full transition-colors ${tool.bgColor} ${tool.hoverBg}`}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`font-headline text-lg ${tool.textColor}`}>
                          {tool.title}
                        </CardTitle>
                        <div className={tool.iconColor}>{tool.icon}</div>
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
                  <p>{tool.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
