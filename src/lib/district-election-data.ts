import districtDataset from "@/data/Districts/nepal_districts.json";
import electionResultsDataset from "@/data/Districts/nepal_election_results_2022.json";

type DistrictSource = {
    district_code: string;
    district_id: number;
    name: string;
    province: string;
    headquarters: string;
    area_sq_km: number;
    elevation_m: number;
    description: string;
    population: {
        2011: number;
        2021: number;
    };
    demographics_2021: {
        sex_ratio: number;
        population_density: number;
        literacy_rate_percent: number;
    };
    annual_growth_rate_percent: number;
};

type ConstituencyResultSource = {
    constituency_code: string;
    district_code: string;
    constituency: string;
    election_year: number;
    winner: {
        name: string;
        party: string;
        votes: number;
    };
    runner_up: {
        name: string;
        party: string;
        votes: number;
    };
    margin: number;
    turnout: {
        total_votes: number;
        valid_votes: number;
        turnout_percent: number;
    };
};

export type DistrictConstituencyResult = {
    constituencyCode: string;
    constituencyName: string;
    winnerName: string;
    winnerParty: string;
    winnerVotes: number;
    winnerVoteShare: number;
    runnerUpName: string;
    runnerUpParty: string;
    runnerUpVotes: number;
    marginVotes: number;
    turnoutPercent: number;
    totalVotes: number;
    validVotes: number;
};

export type DistrictElectionProfile = {
    districtCode: string;
    districtName: string;
    districtId: number;
    province: string;
    headquarters: string;
    description: string;
    areaSqKm: number;
    elevationM: number;
    population2011: number;
    population2021: number;
    annualGrowthRatePercent: number;
    literacyRatePercent: number;
    populationDensity: number;
    sexRatio: number;
    constituencyResults: DistrictConstituencyResult[];
    summary: {
        constituencyCount: number;
        avgTurnoutPercent: number;
        totalVotes: number;
        validVotes: number;
        closestMarginVotes: number;
        widestMarginVotes: number;
        partyWins: { party: string; wins: number }[];
    };
};

const DISTRICT_NAME_ALIASES: Record<string, string> = {
    Chitawan: "Chitwan",
    Dhanusha: "Dhanusa",
    Kabhrepalanchok: "Kavrepalanchok",
    Kapilbastu: "Kapilvastu",
    Makawanpur: "Makwanpur",
    Nawalparasi_E: "Nawalpur",
    Nawalparasi_W: "Nawalparasi West",
    Rukum_E: "Eastern Rukum",
    Rukum_W: "Western Rukum",
    Tanahu: "Tanahun",
    Tehrathum: "Terhathum",
};

const districts = (districtDataset as { districts: DistrictSource[] }).districts;
const electionResults = (electionResultsDataset as { results: ConstituencyResultSource[] }).results;

const normalizeDistrictName = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[_\s-]+/g, " ")
        .replace(/[^\w\s]/g, "");

const districtAliasMap = new Map(
    Object.entries(DISTRICT_NAME_ALIASES).map(([rawName, canonicalName]) => [
        normalizeDistrictName(rawName),
        canonicalName,
    ])
);

const districtsByName = new Map(
    districts.map((district) => [normalizeDistrictName(district.name), district])
);

const resultsByDistrictCode = new Map<string, ConstituencyResultSource[]>();
const resultsByExtractedDistrictName = new Map<string, ConstituencyResultSource[]>();

const extractDistrictNameFromConstituency = (constituency: string) =>
    constituency.replace(/\s+\d+[A-Za-z-]*$/, "").trim();

for (const result of electionResults) {
    if (typeof result.district_code === "string") {
        const list = resultsByDistrictCode.get(result.district_code) ?? [];
        list.push(result);
        resultsByDistrictCode.set(result.district_code, list);
    }

    const extractedDistrictName = normalizeDistrictName(
        extractDistrictNameFromConstituency(result.constituency)
    );
    const extractedList = resultsByExtractedDistrictName.get(extractedDistrictName) ?? [];
    extractedList.push(result);
    resultsByExtractedDistrictName.set(extractedDistrictName, extractedList);
}

const toOneDecimal = (value: number) => Math.round(value * 10) / 10;

export function getDistrictElectionProfileByName(
    selectedDistrictName: string
): DistrictElectionProfile | null {
    const normalizedSelected = normalizeDistrictName(selectedDistrictName);
    const canonicalDistrictName = districtAliasMap.get(normalizedSelected) ?? selectedDistrictName;
    const district = districtsByName.get(normalizeDistrictName(canonicalDistrictName));

    if (!district) return null;

    const constituencyRows =
        resultsByDistrictCode.get(district.district_code) ??
        resultsByExtractedDistrictName.get(normalizeDistrictName(district.name)) ??
        [];

    const sortedRows = [...constituencyRows].sort((a, b) =>
        a.constituency_code.localeCompare(b.constituency_code)
    );

    const constituencyResults = sortedRows.map((row) => {
        const winnerVoteShare =
            row.turnout.valid_votes > 0
                ? toOneDecimal((row.winner.votes / row.turnout.valid_votes) * 100)
                : 0;

        return {
            constituencyCode: row.constituency_code,
            constituencyName: row.constituency,
            winnerName: row.winner.name,
            winnerParty: row.winner.party,
            winnerVotes: row.winner.votes,
            winnerVoteShare,
            runnerUpName: row.runner_up.name,
            runnerUpParty: row.runner_up.party,
            runnerUpVotes: row.runner_up.votes,
            marginVotes: row.margin,
            turnoutPercent: row.turnout.turnout_percent,
            totalVotes: row.turnout.total_votes,
            validVotes: row.turnout.valid_votes,
        };
    });

    const totalVotes = constituencyResults.reduce((sum, row) => sum + row.totalVotes, 0);
    const validVotes = constituencyResults.reduce((sum, row) => sum + row.validVotes, 0);
    const avgTurnoutPercent =
        constituencyResults.length > 0
            ? toOneDecimal(
                constituencyResults.reduce((sum, row) => sum + row.turnoutPercent, 0) /
                constituencyResults.length
            )
            : 0;
    const closestMarginVotes =
        constituencyResults.length > 0
            ? Math.min(...constituencyResults.map((row) => row.marginVotes))
            : 0;
    const widestMarginVotes =
        constituencyResults.length > 0
            ? Math.max(...constituencyResults.map((row) => row.marginVotes))
            : 0;

    const partyWinsCounter = new Map<string, number>();
    for (const row of constituencyResults) {
        partyWinsCounter.set(row.winnerParty, (partyWinsCounter.get(row.winnerParty) ?? 0) + 1);
    }

    const partyWins = [...partyWinsCounter.entries()]
        .map(([party, wins]) => ({ party, wins }))
        .sort((a, b) => b.wins - a.wins);

    return {
        districtCode: district.district_code,
        districtName: district.name,
        districtId: district.district_id,
        province: district.province,
        headquarters: district.headquarters,
        description: district.description,
        areaSqKm: district.area_sq_km,
        elevationM: district.elevation_m,
        population2011: district.population[2011],
        population2021: district.population[2021],
        annualGrowthRatePercent: district.annual_growth_rate_percent,
        literacyRatePercent: district.demographics_2021.literacy_rate_percent,
        populationDensity: district.demographics_2021.population_density,
        sexRatio: district.demographics_2021.sex_ratio,
        constituencyResults,
        summary: {
            constituencyCount: constituencyResults.length,
            avgTurnoutPercent,
            totalVotes,
            validVotes,
            closestMarginVotes,
            widestMarginVotes,
            partyWins,
        },
    };
}
