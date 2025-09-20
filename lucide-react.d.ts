import type { LucideProps, LucideIcon } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
declare module 'lucide-react' {
    export const FileText: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    export const HeartPulse: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    export const Filter: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    export const X: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

  
