import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Leader from '@/models/Leader';
import History from '@/models/History';
import { apiResponse, apiError } from '@/lib/middleware';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentDay = today.getDate(); // 1-31

        // Helper to build date match query
        // Since MongoDB stores full dates, we need aggregation to match just month/day
        const matchStage = {
            $expr: {
                $and: [
                    { $eq: [{ $month: "$date" }, currentMonth] },
                    { $eq: [{ $dayOfMonth: "$date" }, currentDay] }
                ]
            }
        };

        // 1. Check History
        // History model has `date` field
        const historicalEvents = await History.aggregate([
            {
                $match: {
                    status: 'published',
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$date" }, currentMonth] },
                            { $eq: [{ $dayOfMonth: "$date" }, currentDay] }
                        ]
                    }
                }
            },
            { $limit: 5 }
        ]);

        // 2. Check Leaders (Birthdays/Death days)
        // Leader model has `birthDate` and `deathDate`
        const leadersBirthdays = await Leader.aggregate([
            {
                $match: {
                    status: 'published',
                    isActive: true,
                    birthDate: { $exists: true },
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$birthDate" }, currentMonth] },
                            { $eq: [{ $dayOfMonth: "$birthDate" }, currentDay] }
                        ]
                    }
                }
            },
            { $limit: 5 }
        ]);

        const leadersDeathdays = await Leader.aggregate([
            {
                $match: {
                    status: 'published',
                    deathDate: { $exists: true },
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$deathDate" }, currentMonth] },
                            { $eq: [{ $dayOfMonth: "$deathDate" }, currentDay] }
                        ]
                    }
                }
            },
            { $limit: 5 }
        ]);

        // 3. Check Articles (Special events)
        // Article has `eventDate`
        const specialArticles = await Article.aggregate([
            {
                $match: {
                    status: 'published',
                    eventDate: { $exists: true },
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$eventDate" }, currentMonth] },
                            { $eq: [{ $dayOfMonth: "$eventDate" }, currentDay] }
                        ]
                    }
                }
            },
            { $limit: 5 }
        ]);

        // Combine results
        const specialEvents = [
            ...historicalEvents.map((h: any) => ({
                type: 'history',
                title: h.title,
                image: h.image,
                date: h.date,
                id: h._id
            })),
            ...leadersBirthdays.map((l: any) => ({
                type: 'leader_birth',
                title: l.name,
                image: l.image,
                date: l.birthDate,
                id: l._id
            })),
            ...leadersDeathdays.map((l: any) => ({
                type: 'leader_death',
                title: l.name,
                image: l.image,
                date: l.deathDate,
                id: l._id
            })),
            ...specialArticles.map((a: any) => ({
                type: 'article_event',
                title: a.title,
                image: a.image,
                date: a.eventDate,
                id: a._id
            }))
        ];

        return apiResponse({
            isSpecialDay: specialEvents.length > 0,
            count: specialEvents.length,
            events: specialEvents
        });

    } catch (error) {
        console.error('Special days check error:', error);
        // Don't fail the page load if this minor feature fails
        return apiResponse({ isSpecialDay: false, events: [] });
    }
}
