'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters long.'),
  keywords: z.string().min(3, 'Please provide at least one keyword.'),
});

type SeoFormValues = z.infer<typeof formSchema>;

interface SeoBoosterFormProps {
  onSubmit: (data: SeoFormValues) => Promise<void>;
  isLoading: boolean;
}

export default function SeoBoosterForm({
  onSubmit,
  isLoading,
}: SeoBoosterFormProps) {
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      keywords: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the full text content of your webpage here..."
                    className="min-h-[200px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Keywords</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., nextjs development, client-side tools"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Get Suggestions'}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
