// Analytics data for Election 2026 Dashboard
import { getAllDistrictNews } from "./districts-data";

export interface AnalyticsData {
    partyProjections: PartyProjection[];
    electionResults2079: PartyProjection[];
    electionResults2074: PartyProjection[];
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
    prVotePercentage?: number;
    prSeats?: number;
    fptpSeats?: number;
}

export interface DemographicsData {
    voterRollByCycle?: {
        cycle: string;
        registered: number;
        turnout?: number | null;
        source: {
            abbr: string;
            label: string;
            url: string;
        };
    }[];
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
    marginVotes?: number;
    sourceYear?: number;
    sources?: {
        abbr: string;
        label: string;
        url: string;
    }[];
}

export interface RegionalData {
    province: string;
    districts: number;
    totalSeats: number;
    leadingParty: string;
    leadingPartySeats: number;
    runnerUpParty: string;
    runnerUpPartySeats: number;
    leadingPrParty: string;
    leadingPrVoteShare: number;
    runnerUpPrParty: string;
    runnerUpPrVoteShare: number;
    source?: string;
}

export interface TrendingTopic {
    topic: string;
    topicNe?: string;
    mentions: number;
    trend: "up" | "down" | "stable";
    changePercent?: number;
    category?: string;
    sourceCount?: number;
    momentumScore?: number;
    summary?: string;
    summaryNe?: string;
    tags?: string[];
    lastUpdated?: string;
    verification?: "verified" | "partial" | "fallback";
    references?: {
        abbr: string;
        source: string;
        url: string;
        title: string;
        publishedAt?: string;
        platform?: "news" | "x";
        verified?: boolean;
    }[];
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
            voteSharePercentage: 25.71,
            prVotePercentage: 25.71,
            prSeats: 32,
            fptpSeats: 57,
            change: 0
        },
        {
            party: "CPN-UML",
            partySlug: "cpn-uml",
            color: "#E34234",
            projectedSeats: 78,
            voteSharePercentage: 26.95,
            prVotePercentage: 26.95,
            prSeats: 34,
            fptpSeats: 44,
            change: 0
        },
        {
            party: "CPN (Maoist Centre)",
            partySlug: "cpn-maoist",
            color: "#8B0000",
            projectedSeats: 32,
            voteSharePercentage: 11.13,
            prVotePercentage: 11.13,
            prSeats: 14,
            fptpSeats: 18,
            change: 0
        },
        {
            party: "Rastriya Swatantra Party",
            partySlug: "rsp",
            color: "#4169E1",
            projectedSeats: 20,
            voteSharePercentage: 10.7,
            prVotePercentage: 10.7,
            prSeats: 13,
            fptpSeats: 7,
            change: 0
        },
        {
            party: "RPP",
            partySlug: "rpp",
            color: "#FFD700",
            projectedSeats: 14,
            voteSharePercentage: 5.57,
            prVotePercentage: 5.57,
            prSeats: 7,
            fptpSeats: 7,
            change: 0
        },
        {
            party: "People's Socialist Party, Nepal",
            partySlug: "psp-nepal",
            color: "#2E8B57",
            projectedSeats: 12,
            voteSharePercentage: 3.99,
            prVotePercentage: 3.99,
            prSeats: 5,
            fptpSeats: 7,
            change: 0
        },
        {
            party: "CPN (Unified Socialist)",
            partySlug: "cpn-unified-socialist",
            color: "#FF69B4",
            projectedSeats: 10,
            voteSharePercentage: 2.83,
            prVotePercentage: 2.83,
            prSeats: 0,
            fptpSeats: 10,
            change: 0
        },
        {
            party: "Janamat Party",
            partySlug: "janamat-party",
            color: "#8A2BE2",
            projectedSeats: 6,
            voteSharePercentage: 3.74,
            prVotePercentage: 3.74,
            prSeats: 5,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Loktantrik Samajwadi Party",
            partySlug: "loktantrik-samajwadi-party",
            color: "#0D6EFD",
            projectedSeats: 4,
            voteSharePercentage: 1.59,
            prVotePercentage: 1.59,
            prSeats: 0,
            fptpSeats: 4,
            change: 0
        },
        {
            party: "Nagarik Unmukti Party",
            partySlug: "nagarik-unmukti-party",
            color: "#20C997",
            projectedSeats: 3,
            voteSharePercentage: 1.32,
            prVotePercentage: 1.32,
            prSeats: 0,
            fptpSeats: 3,
            change: 0
        },
        {
            party: "Nepal Workers and Peasants Party",
            partySlug: "nwpp",
            color: "#A0522D",
            projectedSeats: 1,
            voteSharePercentage: 0.54,
            prVotePercentage: 0.54,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Rastriya Janamorcha",
            partySlug: "rastriya-janamorcha",
            color: "#D63384",
            projectedSeats: 1,
            voteSharePercentage: 0.45,
            prVotePercentage: 0.45,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Independent",
            partySlug: "independent",
            color: "#9E9E9E",
            projectedSeats: 5,
            voteSharePercentage: 0,
            prSeats: 0,
            fptpSeats: 5,
            change: 0
        }
    ],

    electionResults2074: [
        {
            party: "CPN-UML",
            partySlug: "cpn-uml",
            color: "#E34234",
            projectedSeats: 121,
            voteSharePercentage: 33.25,
            prVotePercentage: 33.25,
            prSeats: 41,
            fptpSeats: 80,
            change: 0
        },
        {
            party: "Nepali Congress",
            partySlug: "nepali-congress",
            color: "#50C878",
            projectedSeats: 63,
            voteSharePercentage: 32.78,
            prVotePercentage: 32.78,
            prSeats: 40,
            fptpSeats: 23,
            change: 0
        },
        {
            party: "CPN (Maoist Centre)",
            partySlug: "cpn-maoist",
            color: "#8B0000",
            projectedSeats: 53,
            voteSharePercentage: 13.66,
            prVotePercentage: 13.66,
            prSeats: 17,
            fptpSeats: 36,
            change: 0
        },
        {
            party: "Rastriya Janata Party Nepal",
            partySlug: "rastriya-janata-party-nepal",
            color: "#FFB300",
            projectedSeats: 17,
            voteSharePercentage: 4.95,
            prVotePercentage: 4.95,
            prSeats: 6,
            fptpSeats: 11,
            change: 0
        },
        {
            party: "Federal Socialist Forum, Nepal",
            partySlug: "federal-socialist-forum-nepal",
            color: "#FD7E14",
            projectedSeats: 16,
            voteSharePercentage: 4.93,
            prVotePercentage: 4.93,
            prSeats: 6,
            fptpSeats: 10,
            change: 0
        },
        {
            party: "Rastriya Prajatantra Party",
            partySlug: "rpp",
            color: "#FFD700",
            projectedSeats: 1,
            voteSharePercentage: 2.06,
            prVotePercentage: 2.06,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Naya Shakti Party, Nepal",
            partySlug: "naya-shakti-party-nepal",
            color: "#6B7280",
            projectedSeats: 1,
            voteSharePercentage: 0.86,
            prVotePercentage: 0.86,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Rastriya Janamorcha",
            partySlug: "rastriya-janamorcha",
            color: "#D63384",
            projectedSeats: 1,
            voteSharePercentage: 0.65,
            prVotePercentage: 0.65,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Nepal Workers and Peasants Party",
            partySlug: "nwpp",
            color: "#A0522D",
            projectedSeats: 1,
            voteSharePercentage: 0.59,
            prVotePercentage: 0.59,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        },
        {
            party: "Independent",
            partySlug: "independent",
            color: "#9E9E9E",
            projectedSeats: 1,
            voteSharePercentage: 0,
            prSeats: 0,
            fptpSeats: 1,
            change: 0
        }
    ],

    demographicsData: {
        voterRollByCycle: [
            {
                cycle: "2017 Federal",
                registered: 15427731,
                turnout: 68.63,
                source: {
                    abbr: "WP-2017",
                    label: "Wikipedia: 2017 Nepalese general election",
                    url: "https://en.wikipedia.org/wiki/2017_Nepalese_general_election",
                },
            },
            {
                cycle: "2022 Local",
                registered: 17733723,
                turnout: 70.96,
                source: {
                    abbr: "WP-2022L",
                    label: "Wikipedia: 2022 Nepalese local elections",
                    url: "https://en.wikipedia.org/wiki/2022_Nepalese_local_elections",
                },
            },
            {
                cycle: "2022 Federal",
                registered: 17988570,
                turnout: 61.85,
                source: {
                    abbr: "WP-2022F",
                    label: "Wikipedia: 2022 Nepalese general election",
                    url: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
                },
            },
            {
                cycle: "2026 Federal",
                registered: 18903689,
                turnout: null,
                source: {
                    abbr: "WP-2026",
                    label: "Wikipedia: 2026 Nepalese general election",
                    url: "https://en.wikipedia.org/wiki/2026_Nepalese_general_election",
                },
            },
        ],
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
        { year: 2017, percentage: 77.8, totalVoters: 15427731 },
        { year: 2022, percentage: 61.0, totalVoters: 17988570 },
        { year: 2026, percentage: 68.5, totalVoters: 18903689 }
    ],

    districtCompetitiveness: [
        {
            district: "Sunsari-4",
            competitivenessScore: 98,
            leadingParty: "NC",
            margin: 0.18,
            marginVotes: 112,
            sourceYear: 2022,
            sources: [
                { abbr: "EC", label: "Election Commission Nepal Results", url: "https://result.election.gov.np/" },
                { abbr: "KT", label: "eKantipur close-race roundup", url: "https://ekantipur.com/en/elections/2022/11/28/with-the-93-constituencies-to-go-who-is-leading-in-the-close-races-166961310073770126.html" },
                { abbr: "NN", label: "NepalNews narrow margins analysis", url: "https://nepalnews.com/s/nation/which-constituencies-had-the-narrowest-winning-margins-in-nepals-2022-election" },
                { abbr: "WP", label: "Wikipedia 2022 Nepalese general election", url: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election" }
            ]
        },
        {
            district: "Dhanusha-4",
            competitivenessScore: 97,
            leadingParty: "UML",
            margin: 0.19,
            marginVotes: 124,
            sourceYear: 2022,
            sources: [
                { abbr: "EC", label: "Election Commission Nepal Results", url: "https://result.election.gov.np/" },
                { abbr: "KT", label: "eKantipur close-race roundup", url: "https://ekantipur.com/en/elections/2022/11/28/with-the-93-constituencies-to-go-who-is-leading-in-the-close-races-166961310073770126.html" },
                { abbr: "NN", label: "NepalNews narrow margins analysis", url: "https://nepalnews.com/s/nation/which-constituencies-had-the-narrowest-winning-margins-in-nepals-2022-election" },
                { abbr: "WP", label: "Wikipedia 2022 Nepalese general election", url: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election" }
            ]
        },
        {
            district: "Kathmandu-1",
            competitivenessScore: 95,
            leadingParty: "NC",
            margin: 0.49,
            marginVotes: 125,
            sourceYear: 2022,
            sources: [
                { abbr: "EC", label: "Election Commission Nepal Results", url: "https://result.election.gov.np/" },
                { abbr: "KT", label: "eKantipur close-race roundup", url: "https://ekantipur.com/en/elections/2022/11/28/with-the-93-constituencies-to-go-who-is-leading-in-the-close-races-166961310073770126.html" },
                { abbr: "NN", label: "NepalNews narrow margins analysis", url: "https://nepalnews.com/s/nation/which-constituencies-had-the-narrowest-winning-margins-in-nepals-2022-election" },
                { abbr: "WP", label: "Wikipedia 2022 Nepalese general election", url: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election" }
            ]
        },
        {
            district: "Parsa-3",
            competitivenessScore: 96,
            leadingParty: "UML",
            margin: 0.32,
            marginVotes: 167,
            sourceYear: 2022,
            sources: [
                { abbr: "EC", label: "Election Commission Nepal Results", url: "https://result.election.gov.np/" },
                { abbr: "KT", label: "eKantipur close-race roundup", url: "https://ekantipur.com/en/elections/2022/11/28/with-the-93-constituencies-to-go-who-is-leading-in-the-close-races-166961310073770126.html" },
                { abbr: "NN", label: "NepalNews narrow margins analysis", url: "https://nepalnews.com/s/nation/which-constituencies-had-the-narrowest-winning-margins-in-nepals-2022-election" },
                { abbr: "WP", label: "Wikipedia 2022 Nepalese general election", url: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election" }
            ]
        },
        {
            district: "Sarlahi-3",
            competitivenessScore: 88,
            leadingParty: "UML",
            margin: 1.1,
            marginVotes: 770,
            sourceYear: 2022,
            sources: [
                { abbr: "EC", label: "Election Commission Nepal Results", url: "https://result.election.gov.np/" },
                { abbr: "KT", label: "eKantipur close-race roundup", url: "https://ekantipur.com/en/elections/2022/11/28/with-the-93-constituencies-to-go-who-is-leading-in-the-close-races-166961310073770126.html" },
                { abbr: "NN", label: "NepalNews narrow margins analysis", url: "https://nepalnews.com/s/nation/which-constituencies-had-the-narrowest-winning-margins-in-nepals-2022-election" },
                { abbr: "WP", label: "Wikipedia 2022 Nepalese general election", url: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election" }
            ]
        }
    ],

    regionalBreakdown: [
        {
            province: "Koshi",
            districts: 14,
            totalSeats: 28,
            leadingParty: "CPN-UML",
            leadingPartySeats: 13,
            runnerUpParty: "Nepali Congress",
            runnerUpPartySeats: 9,
            leadingPrParty: "CPN-UML",
            leadingPrVoteShare: 32.9,
            runnerUpPrParty: "Nepali Congress",
            runnerUpPrVoteShare: 28.45,
            source: "Wikipedia 2022 Nepalese general election"
        },
        {
            province: "Madhesh",
            districts: 8,
            totalSeats: 32,
            leadingParty: "CPN-UML",
            leadingPartySeats: 9,
            runnerUpParty: "Nepali Congress",
            runnerUpPartySeats: 8,
            leadingPrParty: "Nepali Congress",
            leadingPrVoteShare: 20.46,
            runnerUpPrParty: "CPN-UML",
            runnerUpPrVoteShare: 17.49,
            source: "Wikipedia 2022 Nepalese general election"
        },
        {
            province: "Bagmati",
            districts: 13,
            totalSeats: 33,
            leadingParty: "Nepali Congress",
            leadingPartySeats: 13,
            runnerUpParty: "Rastriya Swatantra Party",
            runnerUpPartySeats: 7,
            leadingPrParty: "CPN-UML",
            leadingPrVoteShare: 26.39,
            runnerUpPrParty: "Nepali Congress",
            runnerUpPrVoteShare: 23.24,
            source: "Wikipedia 2022 Nepalese general election"
        },
        {
            province: "Gandaki",
            districts: 11,
            totalSeats: 18,
            leadingParty: "Nepali Congress",
            leadingPartySeats: 10,
            runnerUpParty: "CPN-UML",
            runnerUpPartySeats: 5,
            leadingPrParty: "CPN-UML",
            leadingPrVoteShare: 32.0,
            runnerUpPrParty: "Nepali Congress",
            runnerUpPrVoteShare: 30.8,
            source: "Wikipedia 2022 Nepalese general election"
        },
        {
            province: "Lumbini",
            districts: 12,
            totalSeats: 26,
            leadingParty: "CPN-UML",
            leadingPartySeats: 11,
            runnerUpParty: "Nepali Congress",
            runnerUpPartySeats: 5,
            leadingPrParty: "CPN-UML",
            leadingPrVoteShare: 26.82,
            runnerUpPrParty: "Nepali Congress",
            runnerUpPrVoteShare: 24.69,
            source: "Wikipedia 2022 Nepalese general election"
        },
        {
            province: "Karnali",
            districts: 10,
            totalSeats: 12,
            leadingParty: "NC / Maoist Centre (Tie)",
            leadingPartySeats: 4,
            runnerUpParty: "CPN (Unified Socialist)",
            runnerUpPartySeats: 3,
            leadingPrParty: "CPN-UML",
            leadingPrVoteShare: 31.2,
            runnerUpPrParty: "Nepali Congress",
            runnerUpPrVoteShare: 30.82,
            source: "Wikipedia 2022 Nepalese general election"
        },
        {
            province: "Sudurpashchim",
            districts: 9,
            totalSeats: 16,
            leadingParty: "Nepali Congress",
            leadingPartySeats: 8,
            runnerUpParty: "US / NUP (Tie)",
            runnerUpPartySeats: 3,
            leadingPrParty: "Nepali Congress",
            leadingPrVoteShare: 30.83,
            runnerUpPrParty: "CPN-UML",
            runnerUpPrVoteShare: 29.42,
            source: "Wikipedia 2022 Nepalese general election"
        }
    ],

    trendingTopics: [
        {
            topic: "Public Service Delivery Reform",
            mentions: 18640,
            trend: "up",
            changePercent: 18.4,
            category: "Governance",
            sourceCount: 27,
            momentumScore: 91,
            summary:
                "Debate around faster local services, digital citizen portals, and anti-delay commitments is dominating constituency discussions.",
            tags: ["digital governance", "service standards", "local accountability"],
            lastUpdated: "2026-02-28T08:30:00Z",
        },
        {
            topic: "Youth Employment and Migration",
            mentions: 17920,
            trend: "up",
            changePercent: 16.1,
            category: "Economy",
            sourceCount: 25,
            momentumScore: 88,
            summary:
                "Job creation, skills pipelines, and out-migration pressure remain a core election narrative across major districts.",
            tags: ["skills", "startup policy", "labor market"],
            lastUpdated: "2026-02-28T08:25:00Z",
        },
        {
            topic: "Inflation and Household Costs",
            mentions: 15380,
            trend: "up",
            changePercent: 11.5,
            category: "Economy",
            sourceCount: 23,
            momentumScore: 84,
            summary:
                "Prices of essentials and wage pressure are being framed as immediate voter priorities in campaign messaging.",
            tags: ["cost of living", "prices", "income pressure"],
            lastUpdated: "2026-02-28T08:10:00Z",
        },
        {
            topic: "Corruption and Procurement Oversight",
            mentions: 14870,
            trend: "up",
            changePercent: 9.2,
            category: "Governance",
            sourceCount: 21,
            momentumScore: 81,
            summary:
                "Procurement transparency and abuse-of-office accountability are receiving high media and public attention.",
            tags: ["anti-corruption", "public spending", "oversight"],
            lastUpdated: "2026-02-28T07:55:00Z",
        },
        {
            topic: "Federalism and Inter-Government Coordination",
            mentions: 13460,
            trend: "stable",
            changePercent: 1.8,
            category: "State Structure",
            sourceCount: 18,
            momentumScore: 73,
            summary:
                "Coordination between federal, provincial, and local tiers remains a steady issue in manifesto comparisons.",
            tags: ["federalism", "province powers", "coordination"],
            lastUpdated: "2026-02-28T07:40:00Z",
        },
        {
            topic: "Education Quality and Teacher Accountability",
            mentions: 12790,
            trend: "up",
            changePercent: 6.3,
            category: "Education",
            sourceCount: 17,
            momentumScore: 76,
            summary:
                "Campaigns are emphasizing classroom quality, teacher deployment, and practical curricula for employability.",
            tags: ["school quality", "teacher deployment", "curriculum"],
            lastUpdated: "2026-02-28T07:30:00Z",
        },
        {
            topic: "Urban Mobility and Road Safety",
            mentions: 11320,
            trend: "up",
            changePercent: 7.1,
            category: "Infrastructure",
            sourceCount: 15,
            momentumScore: 72,
            summary:
                "Traffic congestion, public transit reliability, and road safety failures are trending strongly in urban seats.",
            tags: ["public transport", "traffic", "safety"],
            lastUpdated: "2026-02-28T07:15:00Z",
        },
        {
            topic: "Health Access and Insurance Reach",
            mentions: 10280,
            trend: "stable",
            changePercent: 0.9,
            category: "Health",
            sourceCount: 14,
            momentumScore: 68,
            summary:
                "Primary care access and insurance implementation gaps remain central talking points, especially outside metro areas.",
            tags: ["primary care", "insurance", "rural access"],
            lastUpdated: "2026-02-28T07:00:00Z",
        },
        {
            topic: "Agriculture Support and Market Access",
            mentions: 9640,
            trend: "stable",
            changePercent: -0.4,
            category: "Agriculture",
            sourceCount: 13,
            momentumScore: 64,
            summary:
                "Farm input costs, irrigation reliability, and produce-market linkage are recurring issues in rural campaigns.",
            tags: ["farm inputs", "irrigation", "market linkages"],
            lastUpdated: "2026-02-28T06:45:00Z",
        },
        {
            topic: "Climate Resilience and Disaster Readiness",
            mentions: 8830,
            trend: "up",
            changePercent: 5.7,
            category: "Environment",
            sourceCount: 11,
            momentumScore: 61,
            summary:
                "Flood, landslide, and urban drainage preparedness is increasingly included in local-level campaign pledges.",
            tags: ["flood risk", "landslide", "preparedness"],
            lastUpdated: "2026-02-28T06:25:00Z",
        },
        {
            topic: "Digital Rights and Information Integrity",
            mentions: 7910,
            trend: "up",
            changePercent: 8.6,
            category: "Digital Policy",
            sourceCount: 9,
            momentumScore: 58,
            summary:
                "Online speech rules, data protection, and disinformation countermeasures are gaining policy attention.",
            tags: ["privacy", "misinformation", "platform policy"],
            lastUpdated: "2026-02-28T06:10:00Z",
        },
        {
            topic: "Tourism Recovery and Local Enterprise",
            mentions: 7340,
            trend: "down",
            changePercent: -4.2,
            category: "Economy",
            sourceCount: 8,
            momentumScore: 52,
            summary:
                "Still relevant in several regions, but topic share has softened versus governance and jobs narratives.",
            tags: ["tourism", "hospitality", "local business"],
            lastUpdated: "2026-02-28T06:00:00Z",
        },
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
