// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An SEO content suggestion AI agent.
 *
 * - suggestSeoImprovements - A function that handles the SEO content suggestion process.
 * - SuggestSeoImprovementsInput - The input type for the suggestSeoImprovements function.
 * - SuggestSeoImprovementsOutput - The return type for the suggestSeoImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSeoImprovementsInputSchema = z.object({
  content: z.string().describe('The content of the current page.'),
  keywords: z.string().describe('The keywords for which the page should rank.'),
});
export type SuggestSeoImprovementsInput = z.infer<
  typeof SuggestSeoImprovementsInputSchema
>;

const SuggestSeoImprovementsOutputSchema = z.object({
  title: z.string().describe('Suggested title for the page.'),
  metaDescription: z
    .string()
    .describe('Suggested meta description for the page.'),
  keywords: z.array(z.string()).describe('Suggested keywords for the page.'),
  contentImprovements: z
    .string()
    .describe('Suggested improvements to the content of the page.'),
});
export type SuggestSeoImprovementsOutput = z.infer<
  typeof SuggestSeoImprovementsOutputSchema
>;

export async function suggestSeoImprovements(
  input: SuggestSeoImprovementsInput
): Promise<SuggestSeoImprovementsOutput> {
  return suggestSeoImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSeoImprovementsPrompt',
  input: {schema: SuggestSeoImprovementsInputSchema},
  output: {schema: SuggestSeoImprovementsOutputSchema},
  prompt: `You are an SEO expert. You will analyze the content of a page and
provide suggestions for how to improve its search engine ranking.

Page Content: {{{content}}}

Keywords: {{{keywords}}}

Suggestions:
`,
});

const suggestSeoImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestSeoImprovementsFlow',
    inputSchema: SuggestSeoImprovementsInputSchema,
    outputSchema: SuggestSeoImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
