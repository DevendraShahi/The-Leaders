export type MaintenanceZone = 'global' | 'public' | 'election';

export interface MaintenanceCheckResult {
    isBlocked: boolean;
    reason?: string;
}

export function isMaintenanceActive(
    settings: any, // Using any for flexibility with serialized data, but represents ISettings['maintenance']
    pathname: string
): MaintenanceCheckResult {
    if (!settings) return { isBlocked: false };

    // 1. Global Lock
    if (settings.global?.isActive) {
        return { isBlocked: true, reason: settings.global.reason || 'System under maintenance.' };
    }

    // 2. Identify Group
    let group: 'public' | 'election' | null = null;
    let pageKey: string | null = null;

    if (pathname.startsWith('/election-2026')) {
        group = 'election';
        // Map election pathnames to keys
        if (pathname === '/election-2026') pageKey = 'dashboard';
        else if (pathname.includes('/parties')) pageKey = 'parties';
        else if (pathname.includes('/candidates') || pathname.includes('/pr-candidates')) pageKey = 'candidates';
        else if (pathname.includes('/daily-brief')) pageKey = 'dailyBrief';
        else if (pathname.includes('/fact-checks')) pageKey = 'factChecks';
        else if (pathname.includes('/map')) pageKey = 'map';
        else if (pathname.includes('/profiles')) pageKey = 'profiles';
    } else if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
        // Assume Public group for everything else (except admin/api)
        group = 'public';
        // Map public pathnames to keys
        if (pathname === '/' || pathname === '/home') pageKey = 'home';
        else if (pathname.includes('/about')) pageKey = 'about';
        else if (pathname.includes('/contact')) pageKey = 'contact';
        else if (pathname.includes('/articles') || pathname.includes('/news')) pageKey = 'articles';
        else if (pathname.includes('/leaders')) pageKey = 'leaders';
        else if (pathname.includes('/history')) pageKey = 'history';
        else if (pathname.includes('/accessibility')) pageKey = 'accessibility';
        else if (pathname.includes('/privacy-policy')) pageKey = 'privacy';
        else if (pathname.includes('/terms')) pageKey = 'terms';
    }

    if (!group) return { isBlocked: false };

    // 3. Check Group Level
    const groupSettings = settings.groups?.[group];
    if (groupSettings?.isActive) {
        return { isBlocked: true, reason: groupSettings.reason || 'Section under maintenance.' };
    }

    // 4. Check Page Level
    if (pageKey && groupSettings?.pages) {
        const pageSettings = groupSettings.pages[pageKey];
        if (pageSettings?.isActive) {
            return { isBlocked: true, reason: pageSettings.reason || 'Page under maintenance.' };
        }
    }

    return { isBlocked: false };
}
