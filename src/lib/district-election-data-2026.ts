import districtDataset from "@/data/Districts/nepal_districts.json";
import electionResults2026Dataset from "@/data/Districts/nepal_election_results_2026.json";

type DistrictSource = {
    district_code: string;
    district_id: number;
    name: string;
    province: string;
    headquarters: string;
};

type HorResultSource = {
    constituency_code: string;
    district_code: string;
    constituency: string;
    district: string;
    province: string;
    election_year: number;
    winner: {
        name: string;
        party: string;
        party_abbr: string;
        symbol: string;
        votes: number;
    };
    runner_up: {
        name: string;
        party: string;
        party_abbr: string;
        symbol: string;
        votes: number;
    };
    margin: number;
    turnout: {
        total_votes: number;
        valid_votes: number;
        turnout_percent: number;
    };
};

export type HorConstituencyResult = {
    constituencyCode: string;
    constituencyName: string;
    winnerName: string;
    winnerParty: string;
    winnerPartyAbbr: string;
    winnerSymbol: string;
    winnerVotes: number;
    winnerVoteShare: number;
    runnerUpName: string;
    runnerUpParty: string;
    runnerUpPartyAbbr: string;
    runnerUpSymbol: string;
    runnerUpVotes: number;
    marginVotes: number;
    turnoutPercent: number;
    totalVotes: number;
    validVotes: number;
};

export type HorDistrictProfile = {
    districtCode: string;
    districtName: string;
    province: string;
    headquarters: string;
    constituencyResults: HorConstituencyResult[];
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
const electionResults = (electionResults2026Dataset as { results: HorResultSource[] }).results;

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

const resultsByDistrictCode = new Map<string, HorResultSource[]>();
const resultsByExtractedDistrictName = new Map<string, HorResultSource[]>();

const extractDistrictNameFromConstituency = (constituency: string) =>
    constituency.replace(/\s+\d+[A-Za-z-]*$/, "").trim();

for (const result of electionResults) {
    if (typeof result.district_code === "string") {
        const list = resultsByDistrictCode.get(result.district_code) ?? [];
        list.push(result);
        resultsByDistrictCode.set(result.district_code, list);
    }

    const extractedRaw = extractDistrictNameFromConstituency(result.constituency);
    const extractedNormalized = normalizeDistrictName(extractedRaw);
    const extractedCanonical =
        districtAliasMap.get(extractedNormalized) ?? extractedRaw;
    const extractedKey = normalizeDistrictName(extractedCanonical);
    const extractedList =
        resultsByExtractedDistrictName.get(extractedKey) ?? [];
    extractedList.push(result);
    resultsByExtractedDistrictName.set(extractedKey, extractedList);
}

const toOneDecimal = (value: number) => Math.round(value * 10) / 10;

export function getHorResultsByDistrict(
    selectedDistrictName: string
): HorConstituencyResult[] {
    const normalizedSelected = normalizeDistrictName(selectedDistrictName);
    const canonicalDistrictName =
        districtAliasMap.get(normalizedSelected) ?? selectedDistrictName;
    const district = districtsByName.get(normalizeDistrictName(canonicalDistrictName));

    if (!district) return [];

    const rows =
        resultsByExtractedDistrictName.get(normalizeDistrictName(district.name)) ??
        resultsByDistrictCode.get(district.district_code) ??
        [];

    return [...rows]
        .sort((a, b) => a.constituency_code.localeCompare(b.constituency_code))
        .map((row) => {
            const winnerVoteShare =
                row.turnout.valid_votes > 0
                    ? toOneDecimal((row.winner.votes / row.turnout.valid_votes) * 100)
                    : 0;

            return {
                constituencyCode: row.constituency_code,
                constituencyName: row.constituency,
                winnerName: row.winner.name,
                winnerParty: row.winner.party,
                winnerPartyAbbr: row.winner.party_abbr,
                winnerSymbol: row.winner.symbol,
                winnerVotes: row.winner.votes,
                winnerVoteShare,
                runnerUpName: row.runner_up.name,
                runnerUpParty: row.runner_up.party,
                runnerUpPartyAbbr: row.runner_up.party_abbr,
                runnerUpSymbol: row.runner_up.symbol,
                runnerUpVotes: row.runner_up.votes,
                marginVotes: row.margin,
                turnoutPercent: row.turnout.turnout_percent,
                totalVotes: row.turnout.total_votes,
                validVotes: row.turnout.valid_votes,
            };
        });
}

export function getHorDistrictProfileByName(
    selectedDistrictName: string
): HorDistrictProfile | null {
    const normalizedSelected = normalizeDistrictName(selectedDistrictName);
    const canonicalDistrictName =
        districtAliasMap.get(normalizedSelected) ?? selectedDistrictName;
    const district = districtsByName.get(normalizeDistrictName(canonicalDistrictName));

    if (!district) return null;

    const constituencyResults = getHorResultsByDistrict(selectedDistrictName);

    if (constituencyResults.length === 0) return null;

    const totalVotes = constituencyResults.reduce(
        (sum, row) => sum + row.totalVotes,
        0
    );
    const validVotes = constituencyResults.reduce(
        (sum, row) => sum + row.validVotes,
        0
    );
    const avgTurnoutPercent =
        constituencyResults.length > 0
            ? toOneDecimal(
                constituencyResults.reduce(
                    (sum, row) => sum + row.turnoutPercent,
                    0
                ) / constituencyResults.length
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
        partyWinsCounter.set(
            row.winnerParty,
            (partyWinsCounter.get(row.winnerParty) ?? 0) + 1
        );
    }

    const partyWins = [...partyWinsCounter.entries()]
        .map(([party, wins]) => ({ party, wins }))
        .sort((a, b) => b.wins - a.wins);

    return {
        districtCode: district.district_code,
        districtName: district.name,
        province: district.province,
        headquarters: district.headquarters,
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
