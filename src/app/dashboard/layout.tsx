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
} from '@/components/ui/sidebar';
import {
  Calculator,
  HardHat,
  Landmark,
  LayoutDashboard,
  Percent,
  Ruler,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Logo() {
  return (
    <div className="flex items-center gap-2.5 p-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <HardHat />
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
                tooltip="BMI Calculator"
                isActive={pathname === '/dashboard/bmi-calculator'}
              >
                <Link href="/dashboard/bmi-calculator">
                  <Calculator />
                  <span>BMI Calculator</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="EMI Calculator"
                isActive={pathname === '/dashboard/emi-calculator'}
              >
                <Link href="/dashboard/emi-calculator">
                  <Landmark />
                  <span>EMI Calculator</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Currency Converter"
                isActive={pathname === '/dashboard/currency-converter'}
              >
                <Link href="/dashboard/currency-converter">
                  <Wallet />
                  <span>Currency Converter</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Unit Converter"
                isActive={pathname === '/dashboard/unit-converter'}
              >
                <Link href="/dashboard/unit-converter">
                  <Ruler />
                  <span>Unit Converter</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Tax Calculator"
                isActive={pathname === '/dashboard/tax-calculator'}
              >
                <Link href="/dashboard/tax-calculator">
                  <Percent />
                  <span>Tax Calculator</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
