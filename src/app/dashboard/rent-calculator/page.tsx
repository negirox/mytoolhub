
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RentCalculatorPage() {
  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Rent Calculator</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Rent Calculator
              </CardTitle>
              <CardDescription>
                This calculator will help you estimate your rent payments.
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
