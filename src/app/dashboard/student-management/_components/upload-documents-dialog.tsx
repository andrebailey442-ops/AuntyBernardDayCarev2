
'use client';

import * as React from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Student, StudentDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { File, Upload, View, Trash2 } from 'lucide-react';
import { updateStudent } from '@/services/students';
import { getStudent } from '@/services/students';

type UploadDocumentsDialogProps = {
  student: Student;
  onUploadComplete: () => void;
};

export default function UploadDocumentsDialog({ student, onUploadComplete }: UploadDocumentsDialogProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = React.useState<StudentDocument[]>(student.documents || []);
  const [isLoading, setIsLoading] = React.useState(false);
  const fileUploadRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newDocument: StudentDocument = {
        name: file.name,
        url: dataUrl,
        type: file.type,
      };
      setDocuments(prev => [...prev, newDocument]);
      toast({
        title: 'Document Added',
        description: `${file.name} has been staged for upload. Click "Save Documents" to confirm.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewDocument = (doc: StudentDocument) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe src="${doc.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      newWindow.document.title = doc.name;
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await updateStudent(student.id, { documents });
      toast({
        title: 'Documents Saved',
        description: `Documents for ${student.name} have been updated.`,
      });
      onUploadComplete();
    } catch (error) {
      console.error('Failed to save documents:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the documents.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Documents for {student.name}</DialogTitle>
        <DialogDescription>
          Add or remove documents for this student. Click "Save Documents" to apply changes.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4 py-4">
        <input
            type="file"
            ref={fileUploadRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
        />
        <Button type="button" variant="outline" className="w-full" onClick={() => fileUploadRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload a File
        </Button>
        <div className="space-y-2">
            {documents.length > 0 ? (
                documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button size="icon" variant="ghost" onClick={() => handleViewDocument(doc)}>
                                <View className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => handleRemoveDocument(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded.</p>
            )}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Documents'}
        </Button>
      </DialogFooter>
    </>
  );
}
