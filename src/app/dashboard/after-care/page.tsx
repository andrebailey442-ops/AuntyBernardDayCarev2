
import AfterCareManager from './_components/after-care-manager';
import QuickLinks from './_components/quick-links';

export default function AfterCarePage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
       <div className="col-span-1 lg:col-span-3">
          <QuickLinks />
        </div>
        <AfterCareManager />
    </div>
  );
}
