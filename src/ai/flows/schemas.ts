import { z } from 'zod';

const RowDataSchema = z.record(z.any());
export const AnalyzeStudentImportInputSchema = z.array(RowDataSchema);
export type AnalyzeStudentImportInput = z.infer<typeof AnalyzeStudentImportInputSchema>;

export const MappedStudentSchema = z.object({
    name: z.string().describe("The student's full name."),
    age: z.number().describe("The student's age, calculated from date of birth if possible."),
    dob: z.string().describe("The student's date of birth in ISO 8601 format (YYYY-MM-DD)."),
    parentContact: z.string().email().describe("The parent's email address."),
    parentFirstName: z.string().optional().describe("The parent's first name."),
    parentLastName: z.string().optional().describe("The parent's last name."),
    parentPhone: z.string().optional().describe("The parent's phone number."),
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
