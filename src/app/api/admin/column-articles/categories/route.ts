import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ColumnArticle } from '@/models/ElectionContent';
import { withAuth, apiResponse, apiError } from '@/lib/middleware';

async function getCategories() {
    try {
        await dbConnect();
        
        // Fetch all distinct categories directly from Mongo
        const categories = await ColumnArticle.distinct("category");
        
        // Filter out nulls/empty strings just in case
        const dbCategories = categories.filter(c => typeof c === 'string' && c.trim().length > 0);

        const defaultCategories = ['Politics', 'Economics', 'Sports', 'International', 'Technology', 'Health', 'Education', 'Entertainment', 'Society'];
        
        // Merge and deduplicate using Set (case-insensitive deduplication for presentation is optional, here we just do exact match)
        const validCategories = Array.from(new Set([...defaultCategories, ...dbCategories]));

        // Sort alphabetically
        validCategories.sort((a, b) => a.localeCompare(b));

        return apiResponse({ categories: validCategories });
    } catch (error) {
        console.error('Fetch distinct categories error:', error);
        return apiError('Failed to fetch categories', 500);
    }
}

export const GET = withAuth(getCategories);
