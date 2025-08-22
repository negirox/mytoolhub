
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Ruler, Wallet, Bed, Image as ImageIcon } from 'lucide-react';
import { Metadata } from 'next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

export const metadata: Metadata = {
    title: 'General Utilities | MyToolHub',
    description: 'A collection of general utility converters and calculators for everyday use.'
};

const tools = [
  {
    title: 'Currency Converter',
    description: 'Convert between different currencies with real-time rates.',
    href: '/currency-converter',
    icon: <Wallet className="size-8" />,
    bgColor: 'bg-teal-100 dark:bg-teal-900/50',
    textColor: 'text-teal-800 dark:text-teal-200',
    hoverBg: 'hover:bg-teal-200 dark:hover:bg-teal-900/80',
    iconColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    title: 'Unit Converter',
    description: 'Convert length, weight, area, volume, and more.',
    href: '/unit-converter',
    icon: <Ruler className="size-8" />,
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    textColor: 'text-orange-800 dark:text-orange-200',
    hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-900/80',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    title: 'Sleep Calculator',
    description: 'Find your optimal bedtime or wake-up time based on sleep cycles.',
    href: '/sleep-calculator',
    icon: <Bed className="size-8" />,
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
    textColor: 'text-indigo-800 dark:text-indigo-200',
    hoverBg: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/80',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    title: 'Image Resizer',
    description: 'Resize and crop images directly in your browser.',
    href: '/image-resizer',
    icon: <ImageIcon className="size-8" />,
    bgColor: 'bg-sky-100 dark:bg-sky-900/50',
    textColor: 'text-sky-800 dark:text-sky-200',
    hoverBg: 'hover:bg-sky-200 dark:hover:bg-sky-900/80',
    iconColor: 'text-sky-600 dark:text-sky-400'
  },
];

export default function GeneralUtilitiesPage() {
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">General Utilities</h1>
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
