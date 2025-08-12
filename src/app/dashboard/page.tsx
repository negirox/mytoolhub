
'use client';

import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, HeartPulse, Landmark, Wrench, Calculator } from 'lucide-react';
import { Clock } from '@/components/ui/clock';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyContext, Currency } from '@/context/CurrencyContext';


const categories = [
  {
    title: 'Health & Fitness',
    description: 'A suite of calculators to help you monitor and achieve your health and fitness goals, from BMI to daily nutritional intake.',
    href: '/dashboard/health-and-fitness',
    icon: <HeartPulse className="size-8" />,
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-800 dark:text-blue-200',
    hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/80',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Financial Calculators',
    description: 'Tools to help you plan your finances, from calculating loan EMIs to understanding your credit card payments and taxes.',
    href: '/dashboard/financial-calculators',
    icon: <Landmark className="size-8" />,
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    textColor: 'text-green-800 dark:text-green-200',
    hoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/80',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'Math Calculators',
    description: 'A collection of handy calculators for everyday math problems, from percentages to simple equations.',
    href: '/dashboard/math-calculators',
    icon: <Calculator className="size-8" />,
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-800 dark:text-purple-200',
    hoverBg: 'hover:bg-purple-200 dark:hover:bg-purple-900/80',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
   {
    title: 'General Utilities',
    description: 'A collection of handy converters for everyday use, including currency exchange and various unit conversions.',
    href: '/dashboard/general-utilities',
    icon: <Wrench className="size-8" />,
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    hoverBg: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/80',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  }
];

export default function DashboardPage() {
    const currencyContext = useContext(CurrencyContext);

    if (!currencyContext) {
        throw new Error("CurrencyContext must be used within a CurrencyProvider");
    }

    const { globalCurrency, setGlobalCurrency } = currencyContext;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
            <Label htmlFor="master-currency" className="text-xs">Default Currency</Label>
            <Select value={globalCurrency} onValueChange={(val) => setGlobalCurrency(val as Currency)}>
                <SelectTrigger id="master-currency" className="h-9 w-[120px]">
                    <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
            </Select>
        </div>
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
            {categories.map((category) => (
              <Tooltip key={category.href}>
                <TooltipTrigger asChild>
                  <Link href={category.href} className="h-full">
                    <Card className={`flex flex-col h-full transition-all duration-300 hover:scale-105 ${category.bgColor} ${category.hoverBg}`}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`font-headline text-lg ${category.textColor}`}>
                          {category.title}
                        </CardTitle>
                        <div className={`${category.iconColor} animate-breathe`}>{category.icon}</div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className={`text-sm ${category.textColor} opacity-80`}>
                          {category.description}
                        </p>
                      </CardContent>
                      <div className="flex items-center p-6 pt-0">
                        <Button>
                          View Tools <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </Card>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to view all {category.title}.</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
