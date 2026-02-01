// Analytics data for Election 2026 Dashboard
import { getAllDistrictNews } from "./districts-data";

export interface AnalyticsData {
    partyProjections: PartyProjection[];
    electionResults2079: PartyProjection[];
    demographicsData: DemographicsData;
    turnoutHistory: TurnoutHistoryEntry[];
    districtCompetitiveness: DistrictCompetitiveness[];
    regionalBreakdown: RegionalData[];
    trendingTopics: TrendingTopic[];
    districtNews: Record<string, DistrictNewsData>;
}

export interface PartyProjection {
    party: string;
    partySlug: string;
    color: string;
    projectedSeats: number;
    voteSharePercentage: number;
    change: number; // +/- from previous election
}

export interface DemographicsData {
    ageDistribution: { range: string; count: number; }[];
    genderDistribution: { gender: string; count: number; percentage: number; }[];
    educationLevels: { level: string; count: number; }[];
}

export interface TurnoutHistoryEntry {
    year: number;
    percentage: number;
    totalVoters: number;
}

export interface DistrictCompetitiveness {
    district: string;
    competitivenessScore: number; // 0-100, higher = more competitive
    leadingParty: string;
    margin: number; // percentage points
}

export interface RegionalData {
    province: string;
    districts: number;
    totalCandidates: number;
    leadingParty: string;
    turnoutProjection: number;
}

export interface TrendingTopic {
    topic: string;
    mentions: number;
    trend: "up" | "down" | "stable";
}

export interface DistrictNews {
    districtName: string;
    recentDevelopments: {
        id: string;
        date: string;
        title: string;
        impact: string;
    }[];
    keyCandidates?: { name: string; party: string; status: string }[];
    upcomingEvents?: { date: string; event: string }[];
}

export interface DistrictNewsData {
    districtName: string;
    latestUpdates: {
        title: string;
        date: string;
        summary: string;
    }[];
    demographicInfo: {
        population: number;
        voters: number;
        constituencies: number;
    };
    historicalResults: {
        year: number;
        winner: string;
        party: string;
        voteShare: number | string;
    }[];
    currentCandidates: number;
}

// Mock data for analytics dashboard
export const analyticsData: AnalyticsData = {
    partyProjections: [
        {
            party: "Rastriya Swatantra Party",
            partySlug: "rsp",
            color: "#4169E1",
            projectedSeats: 72,
            voteSharePercentage: 26.2,
            change: +51
        },
        {
            party: "Nepali Congress",
            partySlug: "nepali-congress",
            color: "#50C878", // Adjusted Green
            projectedSeats: 65,
            voteSharePercentage: 23.6,
            change: -24
        },
        {
            party: "CPN-UML",
            partySlug: "cpn-uml",
            color: "#E34234", // Vermilion/Red
            projectedSeats: 58,
            voteSharePercentage: 21.1,
            change: -20
        },
        {
            party: "CPN (Maoist Centre)",
            partySlug: "cpn-maoist",
            color: "#8B0000",
            projectedSeats: 22,
            voteSharePercentage: 8.0,
            change: -10
        },
        {
            party: "RPP",
            partySlug: "rpp",
            color: "#FFD700",
            projectedSeats: 18,
            voteSharePercentage: 6.5,
            change: +4
        },
        {
            party: "Others",
            partySlug: "others",
            color: "#9E9E9E",
            projectedSeats: 40,
            voteSharePercentage: 14.6,
            change: +19
        }
    ],

    electionResults2079: [
        {
            party: "Nepali Congress",
            partySlug: "nepali-congress",
            color: "#50C878",
            projectedSeats: 89,
            voteSharePercentage: 27.1,
            change: 0
        },
        {
            party: "CPN-UML",
            partySlug: "cpn-uml",
            color: "#E34234",
            projectedSeats: 78,
            voteSharePercentage: 28.4,
            change: 0
        },
        {
            party: "CPN (Maoist Centre)",
            partySlug: "cpn-maoist",
            color: "#8B0000",
            projectedSeats: 32,
            voteSharePercentage: 11.7,
            change: 0
        },
        {
            party: "Rastriya Swatantra Party",
            partySlug: "rsp",
            color: "#4169E1",
            projectedSeats: 21,
            voteSharePercentage: 11.3,
            change: 0
        },
        {
            party: "RPP",
            partySlug: "rpp",
            color: "#FFD700",
            projectedSeats: 14,
            voteSharePercentage: 5.8,
            change: 0
        },
        {
            party: "JSP",
            partySlug: "jsp",
            color: "#2E8B57",
            projectedSeats: 12,
            voteSharePercentage: 4.1,
            change: 0
        },
        {
            party: "Unified Socialist",
            partySlug: "unified-socialist",
            color: "#FF69B4",
            projectedSeats: 10,
            voteSharePercentage: 2.9,
            change: 0
        },
        {
            party: "Others",
            partySlug: "others",
            color: "#9E9E9E",
            projectedSeats: 19,
            voteSharePercentage: 8.7,
            change: 0
        }
    ],

    demographicsData: {
        ageDistribution: [
            { range: "18-25", count: 425000 },
            { range: "26-35", count: 680000 },
            { range: "36-45", count: 540000 },
            { range: "46-55", count: 380000 },
            { range: "56+", count: 275000 }
        ],
        genderDistribution: [
            { gender: "Male", count: 1248, percentage: 52 },
            { gender: "Female", count: 1152, percentage: 48 }
        ],
        educationLevels: [
            { level: "Graduate+", count: 485 },
            { level: "Undergraduate", count: 824 },
            { level: "High School", count: 691 },
            { level: "Other", count: 400 }
        ]
    },

    turnoutHistory: [
        { year: 1991, percentage: 65.2, totalVoters: 7200000 },
        { year: 1994, percentage: 61.9, totalVoters: 8100000 },
        { year: 1999, percentage: 65.8, totalVoters: 9300000 },
        { year: 2008, percentage: 63.3, totalVoters: 11400000 },
        { year: 2013, percentage: 78.3, totalVoters: 12200000 },
        { year: 2017, percentage: 77.8, totalVoters: 15100000 },
        { year: 2022, percentage: 61.0, totalVoters: 17900000 },
        { year: 2026, percentage: 68.5, totalVoters: 19200000 } // Projected
    ],

    districtCompetitiveness: [
        { district: "Kathmandu", competitivenessScore: 92, leadingParty: "RSP", margin: 2.3 },
        { district: "Chitwan", competitivenessScore: 88, leadingParty: "NC", margin: 3.1 },
        { district: "Jhapa", competitivenessScore: 85, leadingParty: "UML", margin: 4.2 },
        { district: "Kaski", competitivenessScore: 82, leadingParty: "NC", margin: 5.5 },
        { district: "Lalitpur", competitivenessScore: 79, leadingParty: "RSP", margin: 6.8 }
    ],

    regionalBreakdown: [
        { province: "Koshi", districts: 14, totalCandidates: 342, leadingParty: "UML", turnoutProjection: 71.2 },
        { province: "Madhesh", districts: 8, totalCandidates: 198, leadingParty: "NC", turnoutProjection: 58.4 },
        { province: "Bagmati", districts: 13, totalCandidates: 425, leadingParty: "RSP", turnoutProjection: 72.8 },
        { province: "Gandaki", districts: 11, totalCandidates: 264, leadingParty: "NC", turnoutProjection: 69.5 },
        { province: "Lumbini", districts: 12, totalCandidates: 298, leadingParty: "UML", turnoutProjection: 65.3 },
        { province: "Karnali", districts: 10, totalCandidates: 187, leadingParty: "Maoist", turnoutProjection: 67.1 },
        { province: "Sudurpashchim", districts: 9, totalCandidates: 215, leadingParty: "NC", turnoutProjection: 66.9 }
    ],

    trendingTopics: [
        { topic: "Economic Reform", mentions: 12500, trend: "up" },
        { topic: "Youth Employment", mentions: 10800, trend: "up" },
        { topic: "Federalism", mentions: 8900, trend: "stable" },
        { topic: "Education Policy", mentions: 7200, trend: "up" },
        { topic: "Healthcare", mentions: 6500, trend: "down" }
    ],

    // Load all 77 districts data
    districtNews: getAllDistrictNews()
};

export function getAnalyticsData(): AnalyticsData {
    return analyticsData;
}

export function getDistrictNews(districtId: string): DistrictNewsData | null {
    return analyticsData.districtNews[districtId] || null;
}
