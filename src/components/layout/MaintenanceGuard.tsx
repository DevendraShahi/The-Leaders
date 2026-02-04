'use client';

import { usePathname } from 'next/navigation';
import { isMaintenanceActive } from '@/lib/maintenance-logic';
import MaintenanceScreen from '@/components/layout/MaintenanceScreen';
import { useEffect, useState } from 'react';

// Use a client component to check pathnames
export default function MaintenanceGuard({
    maintenanceSettings,
    children
}: {
    maintenanceSettings: any;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Initialize state with server-provided settings (fast load)
    const [settings, setSettings] = useState(maintenanceSettings);

    // Check maintenance status using current state
    const check = isMaintenanceActive(settings, pathname || '/');

    // Effect: Re-fetch maintenance settings on navigation (pathname change)
    // accessible via client-side routing.
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Add timestamp to prevent browser caching
                const res = await fetch('/api/maintenance/status?t=' + Date.now(), {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setSettings(json.data);
                    }
                }
            } catch (err) {
                console.error("Maintenance check error", err);
            }
        };

        fetchStatus();
    }, [pathname]);

    if (check.isBlocked) {
        return <MaintenanceScreen reason={check.reason} />;
    }

    return <>{children}</>;
}
