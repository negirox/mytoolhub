
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function HouseAffordabilityCalculatorPage() {
  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">House Affordability Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                House Affordability Calculator
              </CardTitle>
              <CardDescription>
                This calculator will help you determine how much house you can afford.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Coming Soon...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
