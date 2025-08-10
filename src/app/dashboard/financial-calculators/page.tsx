
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CreditCard, Home, Landmark, Percent, Calculator, ChevronsRight, ShieldCheck, House, Repeat, Building, CirclePercent, Banknote, HelpCircle } from 'lucide-react';
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
  {
    title: 'Mortgage Calculator',
    description: 'Estimate your monthly mortgage payments.',
    href: '/dashboard/mortgage-calculator',
    icon: <Home className="size-8" />,
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-800 dark:text-purple-200',
    hoverBg: 'hover:bg-purple-200 dark:hover:bg-purple-900/80',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
   {
    title: 'Amortization Calculator',
    description: 'See a detailed breakdown of your loan payments over time.',
    href: '/dashboard/amortization-calculator',
    icon: <Calculator className="size-8" />,
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
    textColor: 'text-indigo-800 dark:text-indigo-200',
    hoverBg: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/80',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
   {
    title: 'Mortgage Payoff Calculator',
    description: 'Calculate how extra payments can shorten your mortgage term.',
    href: '/dashboard/mortgage-payoff-calculator',
    icon: <ChevronsRight className="size-8" />,
    bgColor: 'bg-pink-100 dark:bg-pink-900/50',
    textColor: 'text-pink-800 dark:text-pink-200',
    hoverBg: 'hover:bg-pink-200 dark:hover:bg-pink-900/80',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    title: 'House Affordability Calculator',
    description: 'Determine how much house you can afford.',
    href: '/dashboard/house-affordability-calculator',
    icon: <House className="size-8" />,
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    textColor: 'text-green-800 dark:text-green-200',
    hoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/80',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'Rent Affordability Calculator',
    description: 'Calculate your affordable monthly rent spending.',
    href: '/dashboard/rent-affordability-calculator',
    icon: <Banknote className="size-8" />,
    bgColor: 'bg-teal-100 dark:bg-teal-900/50',
    textColor: 'text-teal-800 dark:text-teal-200',
    hoverBg: 'hover:bg-teal-200 dark:hover:bg-teal-900/80',
    iconColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    title: 'Debt-to-Income Ratio Calculator',
    description: 'Calculate your debt-to-income (DTI) ratio to assess financial health.',
    href: '/dashboard/dti-calculator',
    icon: <CirclePercent className="size-8" />,
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    textColor: 'text-orange-800 dark:text-orange-200',
    hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-900/80',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    title: 'Real Estate Calculator',
    description: 'Analyze potential real estate investments.',
    href: '/dashboard/real-estate-calculator',
    icon: <Building className="size-8" />,
    bgColor: 'bg-sky-100 dark:bg-sky-900/50',
    textColor: 'text-sky-800 dark:text-sky-200',
    hoverBg: 'hover:bg-sky-200 dark:hover:bg-sky-900/80',
    iconColor: 'text-sky-600 dark:text-sky-400'
  },
  {
    title: 'Refinance Calculator',
    description: 'See if refinancing your mortgage is right for you.',
    href: '/dashboard/refinance-calculator',
    icon: <Repeat className="size-8" />,
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-800 dark:text-blue-200',
    hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/80',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Rental Property Calculator',
    description: 'Calculate the ROI of a rental property.',
    href: '/dashboard/rental-property-calculator',
    icon: <Building className="size-8" />,
    bgColor: 'bg-lime-100 dark:bg-lime-900/50',
    textColor: 'text-lime-800 dark:text-lime-200',
    hoverBg: 'hover:bg-lime-200 dark:hover:bg-lime-900/80',
    iconColor: 'text-lime-600 dark:text-lime-400'
  },
  {
    title: 'APR Calculator',
    description: 'Calculate the Annual Percentage Rate for a loan.',
    href: '/dashboard/apr-calculator',
    icon: <Percent className="size-8" />,
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    textColor: 'text-amber-800 dark:text-amber-200',
    hoverBg: 'hover:bg-amber-200 dark:hover:bg-amber-900/80',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    title: 'FHA Loan Calculator',
    description: 'Estimate payments for an FHA-insured mortgage.',
    href: '/dashboard/fha-loan-calculator',
    icon: <ShieldCheck className="size-8" />,
    bgColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/50',
    textColor: 'text-fuchsia-800 dark:text-fuchsia-200',
    hoverBg: 'hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/80',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400'
  },
  {
    title: 'VA Mortgage Calculator',
    description: 'Calculate mortgage payments for VA loans.',
    href: '/dashboard/va-mortgage-calculator',
    icon: <ShieldCheck className="size-8" />,
    bgColor: 'bg-violet-100 dark:bg-violet-900/50',
    textColor: 'text-violet-800 dark:text-violet-200',
    hoverBg: 'hover:bg-violet-200 dark:hover:bg-violet-900/80',
    iconColor: 'text-violet-600 dark:text-violet-400'
  },
  {
    title: 'Down Payment Calculator',
    description: 'Calculate the required down payment for a home.',
    href: '/dashboard/down-payment-calculator',
    icon: <Banknote className="size-8" />,
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/50',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    hoverBg: 'hover:bg-emerald-200 dark:hover:bg-emerald-900/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    title: 'Rent vs. Buy Calculator',
    description: 'Compare the costs of renting vs. buying a home.',
    href: '/dashboard/rent-vs-buy-calculator',
    icon: <HelpCircle className="size-8" />,
    bgColor: 'bg-gray-100 dark:bg-gray-900/50',
    textColor: 'text-gray-800 dark:text-gray-200',
    hoverBg: 'hover:bg-gray-200 dark:hover:bg-gray-900/80',
    iconColor: 'text-gray-600 dark:text-gray-400'
  },
];

export default function FinancialCalculatorsPage() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Financial Calculators</h1>
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

    