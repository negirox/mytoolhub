
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | MyToolHub',
  description: 'Read the Privacy Policy for MyToolHub. We are committed to protecting your data by performing all calculations on your device. No data is ever stored or transmitted.',
};

export default function PrivacyPage() {
  return (
    <>
      <header className="sticky top-0 z-30 hidden h-14 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm md:flex">
        <h1 className="font-headline text-xl font-semibold">Privacy Policy</h1>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">
              Our Commitment to Your Privacy
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6 text-foreground/80">
            <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">1. The MyToolHub Philosophy</h2>
              <p>
                MyToolHub ("we," "our," or "us") is fundamentally designed to be a privacy-first platform. We believe you shouldn't have to trade your personal information for useful tools. Our core principle is that your data is your own.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">2. No Data Collection</h2>
              <p>
                <strong>We do not collect, store, transmit, or process any personal data you enter into our calculators or converters.</strong>
              </p>
              <p>
                All calculations and conversions are performed directly within your web browser on your own device (client-side). The information you input is never sent to our servers or any third-party services. When you close or refresh the page, the data is gone forever, unless it is stored locally on your device by your browser for your own convenience (e.g., through `localStorage` for settings like currency preferences).
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">3. Information You Provide</h2>
              <p>
                Any data you enter into the input fields of our tools—such as your income, weight, loan amounts, or any other figures—is used solely for the purpose of performing the requested calculation and displaying the result to you. We have no access to this information.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">4. Cookies and Local Storage</h2>
              <p>
                We may use `localStorage` in your browser to store your preferences, such as your chosen theme (light/dark mode) or default currency. This is stored entirely on your device and is not accessible by us. We do not use tracking cookies or any third-party analytics services that would compromise your privacy.
              </p>
            </div>
             <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">5. Third-Party Services</h2>
              <p>
                Our Currency Converter tool uses a free, open-source API (`currency-api`) to fetch the latest exchange rates. This is an automated request to get publicly available rate data; no personal information is sent with this request.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">6. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>
             <div className="space-y-2">
              <h2 className="font-headline text-xl font-semibold">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, you can contact us. However, please note that since we do not store any user data, we cannot fulfill requests for data access or deletion.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
