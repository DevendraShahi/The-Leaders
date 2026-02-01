"use server";

import { DistrictNews, TrendingTopic } from "../analytics-data";

const API_KEY = process.env.NEWSDATAIO_API;
const BASE_URL = "https://newsdata.io/api/1/news";

interface NewsDataResponse {
    status: string;
    totalResults: number;
    results: Array<{
        article_id: string;
        title: string;
        link: string;
        description: string;
        pubDate: string;
        source_id: string;
        source_priority: number;
        image_url?: string;
        category?: string[];
    }>;
}

export async function fetchDistrictNews(district: string): Promise<DistrictNews> {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.warn("NewsData API key missing, using mock data");
        return getMockDistrictNews(district);
    }

    try {
        // Query for district-specific election news in Nepal
        const query = encodeURIComponent(`${district} election Nepal`);
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&q=${query}&country=np&language=en,ne`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) throw new Error("News API failed");

        const data: NewsDataResponse = await response.json();

        if (!data.results || data.results.length === 0) {
            return getMockDistrictNews(district);
        }

        return {
            districtName: district,
            recentDevelopments: data.results.slice(0, 3).map(article => ({
                id: article.article_id,
                date: new Date(article.pubDate).toLocaleDateString(),
                title: article.title,
                impact: "Neutral" // API doesn't provide sentiment, defaulting
            })),
            keyCandidates: [], // Keeping mock/static as requested
            upcomingEvents: [] // API might not have future events clearly
        };
    } catch (error) {
        console.error("Error fetching district news:", error);
        return getMockDistrictNews(district);
    }
}

export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
    if (!API_KEY || API_KEY === 'your_api_key_here') return [];

    try {
        // General election news to find trending topics
        const response = await fetch(
            `${BASE_URL}?apikey=${API_KEY}&q=Nepal election politics&country=np&language=en,ne`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return [];
        const data: NewsDataResponse = await response.json();

        // Simple frequency analysis or just mapping top articles
        // This is a simplified transformation
        return data.results.slice(0, 5).map(article => ({
            topic: article.title.substring(0, 50) + "...",
            mentions: Math.floor(Math.random() * 5000) + 1000, // Mock metric
            trend: "up"
        }));
    } catch (error) {
        return [];
    }
}

// Fallback Mock Data (Preserving existing functionality)
function getMockDistrictNews(district: string): DistrictNews {
    return {
        districtName: district,
        recentDevelopments: [
            { id: "1", date: "2026-01-28", title: "Heavy campaigning reported in urban areas", impact: "High" },
            { id: "2", date: "2026-01-25", title: "New infrastructure projects announced by local leaders", impact: "Medium" }
        ],
        keyCandidates: [
            { name: "Candidate A", party: "Party X", status: "Incumbent" },
            { name: "Candidate B", party: "Party Y", status: "Challenger" }
        ],
        upcomingEvents: [
            { date: "2026-02-05", event: "Public Debate at City Hall" },
            { date: "2026-02-10", event: "Voter Registration Drive" }
        ]
    };
}
