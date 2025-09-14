import StudentProfile from './_components/student-profile';

type StudentProfilePageProps = {
    params: {
        studentId: string;
    }
}

export default function StudentProfilePage({ params }: StudentProfilePageProps) {
  return (
    <div>
      <StudentProfile studentId={params.studentId} />
    </div>
  );
}
