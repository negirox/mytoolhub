
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  HeartPulse,
  Landmark,
  LayoutDashboard,
  Menu,
  Wrench,
  Info,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CurrencyProvider } from '@/context/CurrencyContext';

function Logo() {
  return (
    <div className="flex items-center gap-2.5 p-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Wrench />
      </div>
      <h1 className="font-headline text-lg font-semibold text-sidebar-foreground">
        MyToolHub
      </h1>
    </div>
  );
}

const NAV_GROUPS = [
  {
    heading: 'Health & Fitness',
    href: '/dashboard/health-and-fitness',
    icon: <HeartPulse />,
  },
  {
    heading: 'Financial Calculators',
    href: '/dashboard/financial-calculators',
    icon: <Landmark />,
  },
  {
    heading: 'General Utilities',
    href: '/dashboard/general-utilities',
    icon: <Wrench />,
  },
];

const LEGAL_LINKS = [
    {
        heading: 'About Us',
        href: '/dashboard/about',
        icon: <Info />
    },
    {
        heading: 'Privacy Policy',
        href: '/dashboard/privacy',
        icon: <ShieldCheck />
    }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <CurrencyProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={pathname === '/dashboard'}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {NAV_GROUPS.map((group) => (
                <SidebarMenuItem key={group.href}>
                  <SidebarMenuButton
                        asChild
                        className="justify-between"
                        isActive={pathname.startsWith(group.href)}
                      >
                        <Link href={group.href}>
                          <div className="flex items-center gap-2">
                            {group.icon}
                            <span>{group.heading}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
           <SidebarFooter>
            <SidebarSeparator />
            <SidebarMenu>
                {LEGAL_LINKS.map((link) => (
                    <SidebarMenuItem key={link.href}>
                        <SidebarMenuButton
                            asChild
                            tooltip={link.heading}
                            isActive={pathname === link.href}
                        >
                            <Link href={link.href}>
                                {link.icon}
                                <span>{link.heading}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col min-h-svh">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
                <Logo />
                <SidebarTrigger>
                <Menu />
                </SidebarTrigger>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="mt-auto border-t bg-background/80 py-4 text-center text-xs text-muted-foreground">
                <div className="container mx-auto">
                    <p>&copy; {new Date().getFullYear()} MyToolHub. All Rights Reserved.</p>
                    <nav className="mt-2 space-x-4">
                        <Link href="/dashboard/about" className="hover:text-primary">About Us</Link>
                        <Link href="/dashboard/privacy" className="hover:text-primary">Privacy Policy</Link>
                    </nav>
                </div>
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CurrencyProvider>
  );
}
