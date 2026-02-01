"use server";

interface WikiSummary {
    title: string;
    extract: string;
    thumbnail?: {
        source: string;
        width: number;
        height: number;
    };
    content_urls: {
        desktop: {
            page: string;
        };
    };
}

export async function fetchDistrictInfo(districtName: string): Promise<WikiSummary | null> {
    try {
        // Fetch summary from Wikipedia REST API
        // Append " District, Nepal" to ensure specificity
        const searchTerm = encodeURIComponent(`${districtName}_District,_Nepal`);
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${searchTerm}`,
            { next: { revalidate: 86400 } } // Cache for 24 hours (static data)
        );

        if (response.status === 404) {
            // Try without "District" if failed
            const fallbackTerm = encodeURIComponent(`${districtName},_Nepal`);
            const fallbackResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${fallbackTerm}`
            );
            if (fallbackResponse.ok) return await fallbackResponse.json();
            return null;
        }

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching Wiki info:", error);
        return null;
    }
}
