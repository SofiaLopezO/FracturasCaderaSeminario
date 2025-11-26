"use client";

import RoleGuard from '@/components/RoleGuard';
import TecnologoDashboard from '@/components/Tecnologo/Dashboard';

export default function TecnologoHomePage() {
    return (
        <RoleGuard allow={['tecnologo']}>
            <TecnologoDashboard />
        </RoleGuard>
    );
}
 
