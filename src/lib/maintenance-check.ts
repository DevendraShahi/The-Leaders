import dbConnect from '@/lib/db';
import Settings, { ISettings } from '@/models/Settings';

export interface MaintenanceCheckResult {
    isBlocked: boolean;
    reason?: string;
}

export type MaintenanceZone = 'global' | 'public' | 'election';
export type PublicPages = 'home' | 'about' | 'contact' | 'articles' | 'leaders' | 'history' | 'accessibility' | 'privacy' | 'terms';
export type ElectionPages = 'dashboard' | 'parties' | 'candidates' | 'dailyBrief' | 'factChecks' | 'map' | 'profiles';

// Cached fetcher to avoid DB spam on every request
// Revalidates globally when on-demand revalidation triggers
// export const revalidate = 300;

import { unstable_cache } from 'next/cache';

export const getSettings = unstable_cache(
    async () => {
        try {
            await dbConnect();
            const settings = await Settings.findOne().lean();
            if (!settings) return null;
            return JSON.parse(JSON.stringify(settings)) as ISettings;
        } catch (error) {
            console.error("Failed to load settings from database:", error);
            return null;
        }
    },
    ['settings-cache'],
    { tags: ['settings'] }
);

export async function checkMaintenance(
    context: { group: 'public', page?: PublicPages } | { group: 'election', page?: ElectionPages }
): Promise<MaintenanceCheckResult> {
    try {
        const settings = await getSettings();
        if (!settings || !settings.maintenance) {
            return { isBlocked: false };
        }

        const m = settings.maintenance;

        // 1. Check Global Lock
        if (m.global?.isActive) {
            return { isBlocked: true, reason: m.global.reason || 'System under maintenance.' };
        }

        // 2. Check Group Level
        const groupKey = context.group; // 'public' or 'election'
        const groupSettings = m.groups?.[groupKey];

        if (groupSettings?.isActive) {
            return { isBlocked: true, reason: groupSettings.reason || 'Section under maintenance.' };
        }

        // 3. Check Page Level
        if (context.page && groupSettings?.pages) {
            const pageSettings = (groupSettings.pages as any)[context.page];
            if (pageSettings?.isActive) {
                return { isBlocked: true, reason: pageSettings.reason || 'Page under maintenance.' };
            }
        }

        return { isBlocked: false };
    } catch (error) {
        console.error('Maintenance check failed:', error);
        return { isBlocked: false }; // Fail open to keep site running if DB errors
    }
}
