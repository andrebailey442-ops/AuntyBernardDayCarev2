
import StaffProfile from './_components/staff-profile';

type StaffProfilePageProps = {
    params: {
        staffId: string;
    }
}

export default function StaffProfilePage({ params }: StaffProfilePageProps) {
  return (
    <div>
      <StaffProfile staffId={params.staffId} />
    </div>
  );
}
