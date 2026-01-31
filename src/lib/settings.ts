import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { cache } from 'react';

// Cache the settings fetch for the duration of a request
export const getSettings = cache(async () => {
    try {
        await dbConnect();
        const settings = await Settings.findOne().lean();
        return settings;
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return null;
    }
});
