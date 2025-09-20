import { z } from 'zod';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];


const fileSchema = z
  .any()
  .refine((files) => files?.length == 1, "File is required.")
  .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    "Only .jpg, .jpeg, .png, .webp and .pdf formats are supported."
  )
  .optional()
  .nullable();

export const uploadDocumentSchema = z.object({
  birthCertificate: fileSchema,
  immunizationRecord: fileSchema,
  proofOfAddress: fileSchema,
});

export type UploadDocumentValues = z.infer<typeof uploadDocumentSchema>;


const phoneRegex = new RegExp(
    /^(\+\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
);

const guardianSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters.').max(50, 'First name cannot exceed 50 characters.'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters.').max(50, 'Last name cannot exceed 50 characters.'),
    relationship: z.string().min(2, 'Relationship is required.'),
    contact: z.string().email('Invalid email address.'),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format.'),
    occupation: z.string().optional(),
    placeOfEmployment: z.string().optional(),
    workNumber: z.string().regex(phoneRegex, 'Invalid phone number format.').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    addressSameAsGuardian1: z.boolean().optional(),
});

const authorizedPickupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    relationship: z.string().min(2, 'Relationship is required.'),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format.'),
  });

export const newStudentSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters.').max(50, 'First name cannot exceed 50 characters.'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters.').max(50, 'Last name cannot exceed 50 characters.'),
    dob: z.date({ required_error: 'Date of birth is required' }),
    age: z.number({ required_error: 'Age is required.' }).refine(age => age <= 6, {
        message: "Student's age cannot exceed 6 years for online registration.",
    }),
    gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required.' }),
    guardians: z.array(guardianSchema).min(1, 'At least one guardian is required.').max(2, 'You can add a maximum of 2 guardians.'),
    preschool: z.boolean().default(false),
    afterCare: z.boolean().default(false),
    nursery: z.boolean().default(false),
    emergencyContactName: z.string().min(2, 'Emergency contact name is required.').max(100, 'Name is too long'),
    emergencyContactPhone: z.string().regex(phoneRegex, 'Invalid phone number format.'),
    medicalConditions: z.string().max(500, 'Medical conditions cannot exceed 500 characters.').optional(),
    authorizedPickups: z.array(authorizedPickupSchema).max(5, 'You can add a maximum of 5 authorized pickup persons.').optional(),
}).superRefine((data, ctx) => {
    // Guardian 1 must have an address
    if (data.guardians[0] && (!data.guardians[0].address || !data.guardians[0].city || !data.guardians[0].state)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guardians', 0, 'address'],
            message: 'Address information is required for the primary guardian.',
        });
    }

    // If Guardian 2 exists and address is not same as Guardian 1, address is required
    if (data.guardians[1] && !data.guardians[1].addressSameAsGuardian1) {
        if (!data.guardians[1].address || !data.guardians[1].city || !data.guardians[1].state) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['guardians', 1, 'address'],
                message: 'Address information is required for the second guardian if not the same as the first.',
            });
        }
    }
     // At least one program must be selected
    if (!data.preschool && !data.afterCare && !data.nursery) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['preschool'], // You can attach the error to one of the fields
            message: 'At least one program (Preschool, After-Care, or Nursery) must be selected.',
        });
    }
});


export type NewStudentFormValues = z.infer<typeof newStudentSchema>;
