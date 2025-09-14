import type { LucideProps, LucideIcon } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
declare module 'lucide-react' {
    export const FileText: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

  