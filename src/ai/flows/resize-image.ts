
'use server';
/**
 * @fileOverview An AI flow to resize an image to specific dimensions.
 *
 * - resizeImage - A function that resizes an image using an AI model.
 * - ResizeImageInput - The input type for the resizeImage function.
 * - ResizeImageOutput - The return type for the resizeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ResizeImageInputSchema, ResizeImageOutputSchema } from './schemas';
import type { ResizeImageInput, ResizeImageOutput } from './schemas';

export type { ResizeImageInput, ResizeImageOutput };

export async function resizeImage(input: ResizeImageInput): Promise<ResizeImageOutput> {
  return resizeImageFlow(input);
}

const resizeImageFlow = ai.defineFlow(
  {
    name: 'resizeImageFlow',
    inputSchema: ResizeImageInputSchema,
    outputSchema: ResizeImageOutputSchema,
  },
  async ({ photoDataUri, targetWidth, targetHeight }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        { media: { url: photoDataUri } },
        { text: `Resize this image to exactly ${targetWidth}x${targetHeight} pixels. Maintain the original aspect ratio by cropping if necessary, focusing on the main subject. Do not add any elements or change the content.` },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed to return a valid media object.');
    }
    
    return { imageUrl: media.url };
  }
);

