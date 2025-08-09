import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Calculator, Home, Landmark, Percent, Ruler, Wallet } from 'lucide-react';

const tools = [
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index.',
    href: '/dashboard/bmi-calculator',
    icon: <Calculator className="size-8" />,
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
    title: 'Currency Converter',
    description: 'Convert between different currencies.',
    href: '/dashboard/currency-converter',
    icon: <Wallet className="size-8" />,
  },
  {
    title: 'Unit Converter',
    description: 'Convert between different units of measurement.',
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
                Welcome to MyToolHub
              </CardTitle>
              <CardDescription>
                Your central place for powerful, client-side utilities. Select a
                tool from the sidebar or the list below to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                We're constantly adding new tools to help you with your daily
                tasks. Stay tuned for more!
              </p>
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
