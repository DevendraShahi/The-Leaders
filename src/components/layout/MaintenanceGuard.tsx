'use client';

import { usePathname } from 'next/navigation';
import { isMaintenanceActive } from '@/lib/maintenance-logic';
import MaintenanceScreen from '@/components/layout/MaintenanceScreen';

// Use a client component to check pathnames
export default function MaintenanceGuard({
    maintenanceSettings,
    children
}: {
    maintenanceSettings: any;
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const check = isMaintenanceActive(maintenanceSettings, pathname || '/');

    if (check.isBlocked) {
        return <MaintenanceScreen reason={check.reason} />;
    }

    return <>{children}</>;
}
