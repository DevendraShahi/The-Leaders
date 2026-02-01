import { DISTRICT_FACTS, DistrictFact } from "./district-facts";

export const ALL_DISTRICTS = Object.keys(DISTRICT_FACTS);

// Helper to generate realistic news based on district context
function generateDistrictNews(fact: DistrictFact): any[] {
    const newsItems = [];

    // Scenario 1: Key Figure Activity (if exists)
    if (fact.keyFigure) {
        newsItems.push({
            id: `news-${fact.name}-1`,
            title: `${fact.keyFigure} addresses massive rally in ${fact.headquarters}`,
            date: "2026-01-29",
            summary: `In a show of strength, ${fact.keyFigure} gathered thousands of supporters in ${fact.headquarters}, promising major infrastructure development for ${fact.name}.`,
            impact: "High"
        });
    } else {
        // Generic election prep
        newsItems.push({
            id: `news-${fact.name}-1`,
            title: `Election Commission teams reach remote areas of ${fact.name}`,
            date: "2026-01-28",
            summary: `Logistics teams have deployed to all ${fact.constituencies} constituencies in ${fact.name} to prepare for the upcoming polls.`,
            impact: "Medium"
        });
    }

    // Scenario 2: Competition Dynamics
    const leading = fact.competitors[0];
    const challenger = fact.competitors[1];

    if (fact.stronghold && fact.stronghold.includes("Stronghold")) {
        newsItems.push({
            id: `news-${fact.name}-2`,
            title: `${leading} fortifies position in ${fact.name} as opposition struggles`,
            date: "2026-01-27",
            summary: `With ${fact.name} being a traditional ${leading} stronghold, the party is confident of a sweep, while ${challenger} attempts to break ground.`,
            impact: "Medium"
        });
    } else if (fact.stronghold?.includes("Competitive") || fact.stronghold?.includes("Battleground")) {
        newsItems.push({
            id: `news-${fact.name}-2`,
            title: `Fierce competition likely between ${leading} and ${challenger} in ${fact.name}`,
            date: "2026-01-27",
            summary: `Analysts predict a tight race in ${fact.name} as both ${leading} and ${challenger} ramp up door-to-door campaigns within ${fact.headquarters}.`,
            impact: "High"
        });
    } else {
        newsItems.push({
            id: `news-${fact.name}-2`,
            title: `Local infrastructure takes center stage in ${fact.name} campaigns`,
            date: "2026-01-26",
            summary: `Voters in ${fact.name} are prioritizing road access and drinking water promises over party ideology this election cycle.`,
            impact: "Low"
        });
    }

    // Scenario 3: RSP/New Party Wave (Random injection for realism)
    if (Math.random() > 0.6) {
        newsItems.push({
            id: `news-${fact.name}-3`,
            title: `Rastriya Swatantra Party forms new committees in ${fact.name}`,
            date: "2026-01-25",
            summary: `The RSP has expanded its organizational structure in ${fact.name}, attracting youth voters from traditional parties.`,
            impact: "Medium"
        });
    }

    return newsItems;
}

function generateDistrictData(name: string): any {
    const fact = DISTRICT_FACTS[name];
    if (!fact) return null; // Should not happen

    return {
        districtName: name,
        latestUpdates: generateDistrictNews(fact),
        demographicInfo: {
            population: Math.floor(fact.totalVotersEst * 1.5), // Rough est
            voters: fact.totalVotersEst,
            constituencies: fact.constituencies
        },
        historicalResults: [
            {
                year: 2017,
                winner: "N/A", // Simplified
                party: fact.competitors[0] || "NC",
                voteShare: "42.5"
            },
            {
                year: 2022,
                winner: "N/A",
                party: fact.competitors[1] || "UML",
                voteShare: "38.2"
            }
        ],
        currentCandidates: fact.constituencies * 12 // Avg candidates
    };
}

// Generate district news data for all districts
export const DISTRICT_NEWS_DATA: Record<string, any> = {};
ALL_DISTRICTS.forEach(district => {
    DISTRICT_NEWS_DATA[district] = generateDistrictData(district);
});

export function getAllDistrictNews() {
    return DISTRICT_NEWS_DATA;
}
