import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | MyToolHub',
    default: 'MyToolHub - Free Online Calculators & Converters',
  },
  description: 'A free, powerful hub of client-side tools including BMI, Calorie, EMI, and Currency Converters. Fast, secure, and easy to use.',
  keywords: ['calculator', 'converter', 'bmi', 'emi', 'currency', 'calorie', 'free tools', 'online tools', 'financial calculator', 'health calculator'],
  authors: [{ name: 'Negirox', url: 'https://github.com/negirox' }],
  creator: 'Negirox',
  publisher: 'Negirox',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MyToolHub - Free Online Calculators & Converters',
    description: 'A comprehensive collection of free, client-side tools for health, finance, and general utility.',
    url: siteUrl,
    siteName: 'MyToolHub',
    images: [
      {
        url: `${siteUrl}/og-image.png`, // Assuming you will add an og-image.png to your public folder
        width: 1200,
        height: 630,
        alt: 'MyToolHub - Free Online Calculators & Converters',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyToolHub - Free Online Calculators & Converters',
    description: 'A comprehensive collection of free, client-side tools for health, finance, and general utility.',
     images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9187440931404634" />
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
        src="https://cdn.ampproject.org/v0/amp-auto-ads-0.1.js" data-ad-client="ca-pub-9187440931404634"/>
      </head>
      <body className="font-body antialiased">
        
        {children}
        <Toaster />
      </body>
    </html>
  );
}
