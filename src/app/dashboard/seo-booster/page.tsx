import SeoBoosterClientPage from '@/components/seo-booster-client-page';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function SeoBoosterPage() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-headline text-xl font-semibold">SEO Booster</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <SeoBoosterClientPage />
      </main>
    </>
  );
}
