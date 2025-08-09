import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
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
                tool from the sidebar to get started.
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
            <Link href="/dashboard/seo-booster">
              <Card className="transition-colors hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-headline text-sm font-medium">
                    SEO Booster
                  </CardTitle>
                  <Wand2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Get AI-powered suggestions to improve your page's SEO.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
