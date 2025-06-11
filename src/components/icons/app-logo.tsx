import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
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
      <path d="M20.999 8.999a8.957 8.957 0 0 0-8.999-8.999 8.957 8.957 0 0 0-8.999 8.999A8.957 8.957 0 0 0 12 23a8.957 8.957 0 0 0 8.999-14.001Z" />
      <path d="M15.079 9.055 12 12.133l-3.079-3.078" />
      <path d="M12 12.133V18" />
    </svg>
  );
}
