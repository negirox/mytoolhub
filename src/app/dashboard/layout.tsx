
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
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Calculator,
  ChevronDown,
  CreditCard,
  EggFried,
  HardHat,
  Home,
  Landmark,
  LayoutDashboard,
  Menu,
  Percent,
  Ruler,
  Scale,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

const SidebarCollapsibleGroup = ({
  groupLabel,
  children,
}: {
  groupLabel: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full flex justify-between items-center px-2">
            <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
            <ChevronDown
              className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
            />
          </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenu className="pl-4">
            {children}
        </SidebarMenu>
      </CollapsibleContent>
    </Collapsible>
  );
};


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
            
             <SidebarCollapsibleGroup groupLabel="Health & Fitness">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="BMI Calculator"
                  isActive={pathname === '/dashboard/bmi-calculator'}
                >
                  <Link href="/dashboard/bmi-calculator">
                    <Scale />
                    <span>BMI Calculator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Calorie Calculator"
                  isActive={pathname === '/dashboard/calorie-calculator'}
                >
                  <Link href="/dashboard/calorie-calculator">
                    <Calculator />
                    <span>Calorie Calculator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Protein Calculator"
                  isActive={pathname === '/dashboard/protein-calculator'}
                >
                  <Link href="/dashboard/protein-calculator">
                    <EggFried />
                    <span>Protein Calculator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Fat Intake Calculator"
                  isActive={pathname === '/dashboard/fat-intake-calculator'}
                >
                  <Link href="/dashboard/fat-intake-calculator">
                    <Percent />
                    <span>Fat Intake Calculator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarCollapsibleGroup>

            <SidebarCollapsibleGroup groupLabel="Financial Calculators">
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
                  tooltip="Home Loan Calculator"
                  isActive={pathname === '/dashboard/home-loan-emi-calculator'}
                >
                  <Link href="/dashboard/home-loan-emi-calculator">
                    <Home />
                    <span>Home Loan Calculator</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Credit Card EMI"
                  isActive={pathname === '/dashboard/credit-card-emi-calculator'}
                >
                  <Link href="/dashboard/credit-card-emi-calculator">
                    <CreditCard />
                    <span>Credit Card EMI</span>
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
            </SidebarCollapsibleGroup>
            
            <SidebarCollapsibleGroup groupLabel="General Utilities">
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
            </SidebarCollapsibleGroup>

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
