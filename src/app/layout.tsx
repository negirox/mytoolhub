
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

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
  Github,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CurrencyProvider } from '@/context/CurrencyContext';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

// export const metadata: Metadata = {
//   metadataBase: new URL(siteUrl),
//   title: {
//     template: '%s | MyToolHub',
//     default: 'MyToolHub - Free Online Calculators & Converters',
//   },
//   description: 'A free, powerful hub of client-side tools including BMI, Calorie, EMI, and Currency Converters. Fast, secure, and easy to use.',
//   keywords: ['calculator', 'converter', 'bmi', 'emi', 'currency', 'calorie', 'free tools', 'online tools', 'financial calculator', 'health calculator'],
//   authors: [{ name: 'Negirox', url: 'https://github.com/negirox' }],
//   creator: 'Negirox',
//   publisher: 'Negirox',
//   robots: {
//     index: true,
//     follow: true,
//   },
//   openGraph: {
//     title: 'MyToolHub - Free Online Calculators & Converters',
//     description: 'A comprehensive collection of free, client-side tools for health, finance, and general utility.',
//     url: siteUrl,
//     siteName: 'MyToolHub',
//     images: [
//       {
//         url: `${siteUrl}/og-image.png`, // Assuming you will add an og-image.png to your public folder
//         width: 1200,
//         height: 630,
//         alt: 'MyToolHub - Free Online Calculators & Converters',
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'MyToolHub - Free Online Calculators & Converters',
//     description: 'A comprehensive collection of free, client-side tools for health, finance, and general utility.',
//     images: [`${siteUrl}/og-image.png`],
//   },
//   alternates: {
//     canonical: siteUrl,
//   },
// };

function Logo() {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wrench />
        </div>
        <h1 className="font-headline text-lg font-semibold text-sidebar-foreground">
          MyToolHub
        </h1>
      </div>
    </div>
  );
}

const NAV_GROUPS = [
  {
    heading: 'Health & Fitness',
    href: '/health-and-fitness',
    icon: <HeartPulse />,
  },
  {
    heading: 'Financial Calculators',
    href: '/financial-calculators',
    icon: <Landmark />,
  },
  {
    heading: 'Math Calculators',
    href: '/math-calculators',
    icon: <Calculator />,
  },
  {
    heading: 'General Utilities',
    href: '/general-utilities',
    icon: <Wrench />,
  },
];

const LEGAL_LINKS = [
    {
        heading: 'About Us',
        href: '/about',
        icon: <Info />
    },
    {
        heading: 'Privacy Policy',
        href: '/privacy',
        icon: <ShieldCheck />
    }
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MyToolHub - Free Online Calculators & Converters</title>
        <meta name="description" content="A free, powerful hub of client-side tools including BMI, Calorie, EMI, and Currency Converters. Fast, secure, and easy to use." />
        <meta name="google-adsense-account" content="ca-pub-9187440931404634" />
        <meta name="google-site-verification" content="Ho2zcxC6OxfZE7x7sKnI0PfZHMuQpwYWvmnmjAdcUqg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9187440931404634"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <script async custom-element="amp-auto-ads"
          src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js" data-ad-client="ca-pub-9187440931404634" />
      </head>
      <body className="font-body antialiased">
         <amp-auto-ads type="adsense"
          data-ad-client="ca-pub-9187440931404634">
        </amp-auto-ads>
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
                      isActive={pathname === '/'}
                    >
                      <Link href="/">
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
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="View Source on GitHub"
                        >
                            <Link href="https://github.com/negirox" target="_blank" rel="noopener noreferrer">
                              <Github />
                              <span>GitHub</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
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
                <div className="flex-1">
                    {children}
                </div>
                <footer className="mt-auto border-t bg-background/80 py-4 text-center text-xs text-muted-foreground">
                    <div className="container mx-auto">
                        <p>&copy; {new Date().getFullYear()} MyToolHub. All Rights Reserved.</p>
                        <nav className="mt-2 space-x-4">
                            <Link href="/about" className="hover:text-primary">About Us</Link>
                            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
                            <span className="mt-4 inline-block">
                                Developed by <a href="https://github.com/negirox" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Negirox</a>
                            </span>
                        </nav>
                    </div>
                </footer>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </CurrencyProvider>
        <Toaster />
      </body>
    </html>
  );
}
