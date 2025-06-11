'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Patient } from '@/services/api';
import BiPage from '@/app/bi/page';
import { usePatient } from '@/hooks/use-patient';

export default function PatientBiPage() {
    const patient = usePatient();

    if (!patient) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Patient not found</p>
            </div>
        );
    }

    return <BiPage patient={patient} />;
} 