
'use client';
import type { SVGProps } from 'react';
import { useLogo } from '@/hooks/use-logo';
import Image from 'next/image';

function DefaultBusyBeeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.67 19.33a1 1 0 0 1-1.34 0l-1.33-1.33a1 1 0 0 0-1.41 0l-.63.63a1 1 0 0 1-1.41 0l-.63-.63a1 1 0 0 0-1.41 0l-1.33 1.33a1 1 0 0 1-1.34 0" />
      <path d="m14.33 15.66 1.33-1.33a1 1 0 0 0 0-1.41l-.63-.63a1 1 0 0 1 0-1.41l.63-.63a1 1 0 0 0 0-1.41l-1.33-1.33a1 1 0 0 0-1.41 0l-1.33 1.33a1 1 0 0 1-1.41 0l-.63-.63a1 1 0 0 0-1.41 0l-.63.63a1 1 0 0 1-1.41 0L4.34 7.66a1 1 0 0 1 0-1.34" />
      <path d="M10.33 9.66 9 8.33a1 1 0 0 0-1.41 0l-.63.63a1 1 0 0 1-1.41 0l-.63-.63a1 1 0 0 0-1.41 0L4.34 7.66" />
      <path d="M18 11.5c.33.33.67.67 1 1a2 2 0 0 1-3 3c-1.33-1.33-2.67-2.67-4-4" />
      <path d="M20 7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z" />
      <path d="M14 4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z" />
    </svg>
  );
}

export function BusyBeeLogo(props: SVGProps<SVGSVGElement>) {
    const { logoUrl } = useLogo();
  
    if (logoUrl) {
      // The 'props' contain className, which we want to apply for sizing.
      // We can't spread SVG props to an Image component, so we just extract className.
      return <Image src={logoUrl} alt="Application Logo" className={props.className} width={24} height={24} />;
    }
  
    return <DefaultBusyBeeLogo {...props} />;
}

export function ScholarStartLogo(props: SVGProps<SVGSVGElement>) {
  return <BusyBeeLogo {...props} />;
}
