
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  HeartPulse,
  Home,
  Landmark,
  LayoutDashboard,
  Menu,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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
    heading: 'Mortgage & Real Estate',
    href: '/dashboard/mortgage-and-real-estate',
    icon: <Home />,
  },
  {
    heading: 'General Utilities',
    href: '/dashboard/general-utilities',
    icon: <Wrench />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
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
                <Collapsible>
                  <CollapsibleTrigger asChild>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 [&[data-state=open]>svg]:rotate-90"
                        >
                          <ChevronRight className="transition-transform duration-200" />
                        </Button>
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </Collapsible>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <Logo />
          <SidebarTrigger>
            <Menu />
          </SidebarTrigger>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
