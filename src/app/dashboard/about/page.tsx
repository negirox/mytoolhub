
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, HeartPulse, Landmark, Users, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About MyToolHub',
  description: 'Learn about MyToolHub, your free all-in-one hub for powerful online calculators and converters. Our mission is to provide fast, secure, and user-friendly tools.',
};

export default function AboutPage() {
  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">About Us</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-primary">
                About MyToolHub
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-foreground/80">
              <p>
                MyToolHub is your all-in-one destination for a suite of powerful, free online calculators and converters. Our mission is to provide fast, reliable, and easy-to-use tools that operate entirely on your device, ensuring your data remains private and secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We believe that everyone should have access to high-quality tools without compromising their privacy. In a world where data is a valuable commodity, we've built MyToolHub to be different. All calculations happen directly in your browser, meaning none of your personal information is ever sent to our servers. Fast, secure, and intuitive—that's our promise.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Wrench className="size-8 text-primary" />
                <CardTitle>Powerful & Diverse Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From financial planning and health tracking to everyday unit conversions, our comprehensive library of tools is designed to meet your needs.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <ShieldCheck className="size-8 text-green-500" />
                <CardTitle>Privacy-First Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your privacy is our top priority. All our tools are 100% client-side, ensuring your data never leaves your computer. No tracking, no databases.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Users className="size-8 text-accent" />
                <CardTitle>User-Centric Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We focus on creating a clean, intuitive, and responsive user experience that works seamlessly across all devices, from desktops to mobile phones.
                </p>
              </CardContent>
            </Card>
          </div>
          
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Our Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <HeartPulse className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Health & Fitness</h4>
                        <p className="text-sm text-muted-foreground">Calculators to help you monitor and achieve your health and fitness goals, from BMI to daily nutritional intake.</p>
                    </div>
               </div>
               <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
                        <Landmark className="size-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Financial Calculators</h4>
                        <p className="text-sm text-muted-foreground">Tools to help you plan your finances, from calculating loan EMIs to understanding mortgage payments and taxes.</p>
                    </div>
               </div>
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
                        <Wrench className="size-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold">General Utilities</h4>
                        <p className="text-sm text-muted-foreground">A collection of handy converters for everyday use, including currency exchange and various unit conversions.</p>
                    </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
