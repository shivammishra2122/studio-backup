'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const patientNavItems = [
    { label: 'Cover Sheet', href: '/cover-sheet' },
    { label: 'Dashboard', href: '/vitals-dashbaord'},
    { label: 'Orders', href: '/orders' },
    { label: 'Radiology', href: '/radiology' },
    { label: 'Lab Results', href: '/lab-results' },
    { label: 'Medications', href: '/medications' },
    { label: 'Problems', href: '/problems' },
    { label: 'Allergies', href: '/allergies' },
    { label: 'Vitals', href: '/vitals' },
    { label: 'Notes', href: '/notes' },
];

export default function PatientNav() {
    const { id } = useParams();
    const pathname = usePathname();
    const basePath = `/patients/${id}`;

    return (
        <nav className="flex items-center space-x-1 px-1 pb-0 mb-3 overflow-x-auto no-scrollbar border-b-2 border-border bg-card">
            {patientNavItems.map((item) => {
                const href = `${basePath}${item.href}`;
                const isActive = pathname === href || (item.href === '' && pathname === basePath);

                return (
                    <Link
                        key={item.href}
                        href={href}
                        className={cn(
                            "text-xs px-3 py-1.5 h-auto rounded-b-none rounded-t-md whitespace-nowrap focus-visible:ring-0 focus-visible:ring-offset-0",
                            isActive
                                ? "bg-background text-primary border-x border-t border-border border-b-2 border-b-background shadow-sm relative -mb-px z-10 hover:bg-background hover:text-primary"
                                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border-x border-t border-transparent"
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
} 