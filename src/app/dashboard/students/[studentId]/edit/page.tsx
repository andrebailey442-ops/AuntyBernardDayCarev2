import { EditStudentForm } from './_components/edit-student-form';

type EditStudentPageProps = {
    params: {
        studentId: string;
    }
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  return (
    <div>
      <EditStudentForm studentId={params.studentId} />
    </div>
  );
}
