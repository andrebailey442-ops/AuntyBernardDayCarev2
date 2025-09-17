
import { z } from 'zod';

const RowDataSchema = z.record(z.any());
export const AnalyzeStudentImportInputSchema = z.array(RowDataSchema);
export type AnalyzeStudentImportInput = z.infer<typeof AnalyzeStudentImportInputSchema>;

const GuardianSchema = z.object({
    firstName: z.string().describe("Guardian's first name."),
    lastName: z.string().describe("Guardian's last name."),
    relationship: z.string().describe("Guardian's relationship to the child."),
    contact: z.string().email("Guardian's email address."),
    phone: z.string().describe("Guardian's phone number."),
});

export const MappedStudentSchema = z.object({
    name: z.string().describe("The student's full name."),
    age: z.number().describe("The student's age, calculated from date of birth if possible."),
    dob: z.string().describe("The student's date of birth in ISO 8601 format (YYYY-MM-DD)."),
    guardian1: GuardianSchema.describe("Information for the primary guardian."),
    guardian2: GuardianSchema.optional().describe("Information for the secondary guardian."),
    address: z.string().optional().describe("The student's home address."),
    city: z.string().optional().describe("The city of the student's address."),
    state: z.string().optional().describe("The state of the student's address."),
    afterCare: z.boolean().optional().describe("Whether the student is enrolled in after-care."),
    emergencyContactName: z.string().optional().describe("The name of the emergency contact."),
    emergencyContactPhone: z.string().optional().describe("The phone number of the emergency contact."),
    medicalConditions: z.string().optional().describe("Any medical conditions or allergies."),
});
export type MappedStudent = z.infer<typeof MappedStudentSchema>;

export const AnalyzeStudentImportOutputSchema = z.array(MappedStudentSchema);
export type AnalyzeStudentImportOutput = z.infer<typeof AnalyzeStudentImportOutputSchema>;

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
