
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

export const metadata: Metadata = {
    title: 'Dashboard | MyToolHub',
    description: 'Unlock a suite of powerful, free online calculators and converters designed for your everyday needs. From health and fitness to finance and general utility, all our tools are fast, secure, and operate entirely on your device for maximum privacy.'
};

const tools = [
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index.',
    href: '/dashboard/bmi-calculator',
    icon: <Scale className="size-8" />,
  },
  {
    title: 'Calorie Calculator',
    description: 'Estimate your daily calorie needs for maintenance, fat loss, or muscle gain.',
    href: '/dashboard/calorie-calculator',
    icon: <Calculator className="size-8" />,
  },
   {
    title: 'Protein Calculator',
    description: 'Calculate your optimal daily protein intake based on your goals.',
    href: '/dashboard/protein-calculator',
    icon: <EggFried className="size-8" />,
  },
   {
    title: 'Fat Intake Calculator',
    description: 'Determine your recommended daily fat intake for a balanced diet.',
    href: '/dashboard/fat-intake-calculator',
    icon: <Percent className="size-8" />,
  },
  {
    title: 'EMI Calculator',
    description: 'Calculate your Equated Monthly Installment for any loan.',
    href: '/dashboard/emi-calculator',
    icon: <Landmark className="size-8" />,
  },
   {
    title: 'Home Loan Calculator',
    description: 'Detailed home loan EMI and expense calculator.',
    href: '/dashboard/home-loan-emi-calculator',
    icon: <Home className="size-8" />,
  },
   {
    title: 'Credit Card EMI Calculator',
    description: 'Calculate credit card EMIs with processing fees and GST.',
    href: '/dashboard/credit-card-emi-calculator',
    icon: <CreditCard className="size-8" />,
  },
  {
    title: 'Currency Converter',
    description: 'Convert between different currencies.',
    href: '/dashboard/currency-converter',
    icon: <Wallet className="size-8" />,
  },
  {
    title: 'Unit Converter',
    description: 'Convert length, weight, area, volume, and more.',
    href: '/dashboard/unit-converter',
    icon: <Ruler className="size-8" />,
  },
  {
    title: 'Tax Calculator',
    description: 'A simple tax calculator.',
    href: '/dashboard/tax-calculator',
    icon: <Percent className="size-8" />,
  },
];

export default function DashboardPage() {
  return (
    <>
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
              <Card key={tool.href}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-headline text-lg">
                    {tool.title}
                  </CardTitle>
                  {tool.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
                <div className="flex items-center p-6 pt-0">
                  <Button asChild>
                    <Link href={tool.href}>
                      Go to tool <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
