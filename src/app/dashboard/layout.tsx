
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
} from '@/components/ui/sidebar';
import {
  HeartPulse,
  Landmark,
  LayoutDashboard,
  Menu,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
            
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Health & Fitness"
                  isActive={pathname === '/dashboard/health-and-fitness'}
                >
                  <Link href="/dashboard/health-and-fitness">
                    <HeartPulse />
                    <span>Health & Fitness</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Financial Calculators"
                  isActive={pathname === '/dashboard/financial-calculators'}
                >
                  <Link href="/dashboard/financial-calculators">
                    <Landmark />
                    <span>Financial Calculators</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="General Utilities"
                  isActive={pathname === '/dashboard/general-utilities'}
                >
                  <Link href="/dashboard/general-utilities">
                    <Wrench />
                    <span>General Utilities</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
