import ReportCard from './_components/report-card';

type ReportCardPageProps = {
  params: {
    studentId: string;
  };
};

export default function ReportCardPage({ params }: ReportCardPageProps) {
  return (
    <div className="space-y-6">
      <ReportCard studentId={params.studentId} />
    </div>
  );
}
