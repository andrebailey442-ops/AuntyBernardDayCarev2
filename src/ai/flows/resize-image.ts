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

export const ResizeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be resized, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetWidth: z.number().describe('The target width for the resized image in pixels.'),
  targetHeight: z.number().describe('The target height for the resized image in pixels.'),
});
export type ResizeImageInput = z.infer<typeof ResizeImageInputSchema>;

export const ResizeImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the resized image.'),
});
export type ResizeImageOutput = z.infer<typeof ResizeImageOutputSchema>;

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
