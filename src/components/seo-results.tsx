import type { SuggestSeoImprovementsOutput } from '@/ai/flows/suggest-seo-improvements';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  FileText,
  Tags,
  TextQuote,
  Lightbulb,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface SeoResultsProps {
  suggestions: SuggestSeoImprovementsOutput | null;
  isLoading: boolean;
  error: string | null;
}

const ResultsSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  </div>
);

const InitialState = () => (
  <Card className="flex h-full min-h-[400px] flex-col items-center justify-center border-dashed p-6 text-center">
    <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
    <h3 className="font-headline text-xl font-semibold">
      Awaiting Your Input
    </h3>
    <p className="text-muted-foreground">
      Your AI-powered SEO suggestions will appear here.
    </p>
  </Card>
);

export default function SeoResults({
  suggestions,
  isLoading,
  error,
}: SeoResultsProps) {
  if (isLoading) {
    return <ResultsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!suggestions) {
    return <InitialState />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <TextQuote className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">
              Suggested Title & Description
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-1 font-semibold">Title</h4>
            <p className="rounded-md bg-muted p-3 text-sm">
              {suggestions.title}
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold">Meta Description</h4>
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              {suggestions.metaDescription}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Tags className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Suggested Keywords</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {suggestions.keywords.map(keyword => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
          <Card>
            <AccordionTrigger className="w-full p-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">
                  Content Improvements
                </CardTitle>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <div
                  className="space-y-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: suggestions.contentImprovements.replace(
                      /\n/g,
                      '<br />'
                    ),
                  }}
                />
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
