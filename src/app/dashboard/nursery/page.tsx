
import NurseryManager from './_components/nursery-manager';
import QuickLinks from '../after-care/_components/quick-links';

export default function NurseryPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8">
       <div className="col-span-1 lg:col-span-3">
          <QuickLinks key="quick-links-nursery" />
        </div>
        <NurseryManager />
    </div>
  );
}
