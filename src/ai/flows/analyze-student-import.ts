'use server';

/**
 * @fileOverview Analyzes an imported file to map its data to the student structure.
 *
 * - analyzeStudentImport - A function that analyzes and maps student data from a file.
 * - AnalyzeStudentImportInput - The input type for the analyzeStudentImport function.
 * - MappedStudent - The type for a single mapped student record.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AnalyzeStudentImportInputSchema, AnalyzeStudentImportOutputSchema } from './schemas';
import type { AnalyzeStudentImportInput, AnalyzeStudentImportOutput } from './schemas';

export type { AnalyzeStudentImportInput, AnalyzeStudentImportOutput, MappedStudent } from './schemas';


export async function analyzeStudentImport(input: AnalyzeStudentImportInput): Promise<AnalyzeStudentImportOutput> {
  return analyzeStudentImportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentImportPrompt',
  input: { schema: z.object({ jsonData: z.string() }) },
  output: { schema: AnalyzeStudentImportOutputSchema },
  prompt: `You are a data migration specialist for a preschool management system. Your task is to analyze the provided JSON data, which represents rows from an imported spreadsheet, and map each row to the application's student data structure.

The JSON data is:
{{{jsonData}}}

Please analyze the keys and values in the JSON to intelligently map them to the following fields:
- \`name\`: The student's full name. If you find separate first and last name columns, combine them.
- \`age\`: The student's age. If a date of birth is present, calculate the age based on the current year.
- \`dob\`: The student's date of birth. Convert it to YYYY-MM-DD ISO format.
- \`parentContact\`: The parent's email address.
- \`parentFirstName\`: Parent's first name.
- \`parentLastName\`: Parent's last name.
- \`parentPhone\`: Parent's phone number.
- \`address\`, \`city\`, \`state\`: Address components.
- \`afterCare\`: A boolean indicating if they are in after-care. Look for "yes", "true", or similar values.
- \`emergencyContactName\`, \`emergencyContactPhone\`: Emergency contact details.
- \`medicalConditions\`: Information about allergies or medical needs.

Return an array of JSON objects matching the defined output schema. Be smart about mapping; for example, "Guardian Email" should map to \`parentContact\`. Do not include students with missing or invalid names.
`,
});


const analyzeStudentImportFlow = ai.defineFlow(
  {
    name: 'analyzeStudentImportFlow',
    inputSchema: AnalyzeStudentImportInputSchema,
    outputSchema: AnalyzeStudentImportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ jsonData: JSON.stringify(input) });
    return output || [];
  }
);
