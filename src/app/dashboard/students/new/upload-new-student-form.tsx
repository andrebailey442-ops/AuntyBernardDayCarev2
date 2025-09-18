import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadDocumentValues } from './schema';

const documentFields: (keyof UploadDocumentValues)[] = [
  'birthCertificate',
  'immunizationRecord',
  'proofOfAddress',
];

const documentLabels: Record<keyof UploadDocumentValues, string> = {
  birthCertificate: 'Birth Certificate',
  immunizationRecord: 'Immunization Record',
  proofOfAddress: 'Proof of Address',
};

interface UploadNewStudentFormProps {
  studentId: string;
  form: UseFormReturn<any>; // Allow any form type to be passed in
}

export default function UploadNewStudentForm({ form }: UploadNewStudentFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<keyof UploadDocumentValues, File | null>
  >({
    birthCertificate: null,
    immunizationRecord: null,
    proofOfAddress: null,
  });

  const handleFileChange = (
    field: keyof UploadDocumentValues,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [field]: file }));
      form.setValue(field, event.target.files, { shouldValidate: true });
    }
  };

  const handleRemoveFile = (field: keyof UploadDocumentValues) => {
    setUploadedFiles((prev) => ({ ...prev, [field]: null }));
    form.setValue(field, null, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {documentFields.map((fieldName) => (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{documentLabels[fieldName]}</FormLabel>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  id={fieldName}
                  onChange={(e) => handleFileChange(fieldName, e)}
                  className="hidden"
                />
                <label htmlFor={fieldName} className="w-full">
                  <Button type="button" variant="outline" asChild className="w-full cursor-pointer">
                    <div>
                      {uploadedFiles[fieldName]
                        ? uploadedFiles[fieldName]?.name
                        : `Select ${documentLabels[fieldName]}`}
                    </div>
                  </Button>
                </label>
                {uploadedFiles[fieldName] && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFile(fieldName)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
