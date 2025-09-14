'use server';

/**
 * @fileOverview Suggests attendance statuses based on historical data and time of day.
 *
 * - suggestAttendance - A function that suggests attendance statuses.
 * - SuggestAttendanceInput - The input type for the suggestAttendance function.
 * - SuggestAttendanceOutput - The return type for the suggestAttendance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAttendanceInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  date: z.string().describe('The date for which to suggest attendance (YYYY-MM-DD).'),
});
export type SuggestAttendanceInput = z.infer<typeof SuggestAttendanceInputSchema>;

const SuggestAttendanceOutputSchema = z.object({
  status: z
    .enum(['present', 'absent', 'tardy'])
    .describe('The suggested attendance status.'),
  reason: z.string().optional().describe('The reason for the suggested status.'),
});
export type SuggestAttendanceOutput = z.infer<typeof SuggestAttendanceOutputSchema>;

export async function suggestAttendance(input: SuggestAttendanceInput): Promise<SuggestAttendanceOutput> {
  return suggestAttendanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAttendancePrompt',
  input: {schema: SuggestAttendanceInputSchema},
  output: {schema: SuggestAttendanceOutputSchema},
  prompt: `Based on the student's historical attendance data and the time of day, suggest an attendance status (present, absent, or tardy) for student ID {{{studentId}}} on {{{date}}}. If absent or tardy provide a reason.

  Output in JSON format.`,
});

const suggestAttendanceFlow = ai.defineFlow(
  {
    name: 'suggestAttendanceFlow',
    inputSchema: SuggestAttendanceInputSchema,
    outputSchema: SuggestAttendanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
