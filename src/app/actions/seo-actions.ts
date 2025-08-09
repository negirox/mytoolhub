'use server';

import {
  suggestSeoImprovements,
  type SuggestSeoImprovementsInput,
} from '@/ai/flows/suggest-seo-improvements';

export async function handleSeoSuggestion(input: SuggestSeoImprovementsInput) {
  try {
    const result = await suggestSeoImprovements(input);
    return result;
  } catch (error) {
    console.error('Error in AI flow:', error);
    // Re-throwing the error to be handled by the client component
    throw new Error('Failed to get suggestions from AI. Please try again.');
  }
}
