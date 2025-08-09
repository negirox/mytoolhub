'use client';
import { useState } from 'react';
import { handleSeoSuggestion } from '@/app/actions/seo-actions';
import type { SuggestSeoImprovementsOutput } from '@/ai/flows/suggest-seo-improvements';
import SeoBoosterForm from '@/components/seo-booster-form';
import SeoResults from '@/components/seo-results';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SeoBoosterClientPage() {
  const [suggestions, setSuggestions] =
    useState<SuggestSeoImprovementsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (data: {
    content: string;
    keywords: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await handleSeoSuggestion(data);
      setSuggestions(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle className="font-headline">Analyze Your Content</CardTitle>
            <CardDescription>
              Paste your page content and target keywords to get AI-powered SEO
              improvement suggestions.
            </CardDescription>
          </CardHeader>
          <SeoBoosterForm onSubmit={handleSubmit} isLoading={isLoading} />
        </Card>
      </div>
      <div className="lg:col-span-2">
        <SeoResults
          suggestions={suggestions}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
