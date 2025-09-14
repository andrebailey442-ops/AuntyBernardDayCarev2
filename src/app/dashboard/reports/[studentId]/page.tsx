import ReportCard from './_components/report-card';

type ReportCardPageProps = {
  params: {
    studentId: string;
  };
};

export default function ReportCardPage({ params }: ReportCardPageProps) {
  return (
    <div>
      <ReportCard studentId={params.studentId} />
    </div>
  );
}
