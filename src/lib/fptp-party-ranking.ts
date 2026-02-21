import type { PartyDTO } from "@/lib/election-data";
import type { FPTPCandidateDataset } from "@/lib/fptp-candidate-data";

export interface PartyRankMeta {
    rank: number;
    source: "official" | "fallback";
}

export type PartyRankIndex = Record<string, PartyRankMeta>;

const PARTY_ALIAS_TO_OFFICIAL: Record<string, string> = {
    "नेपाली काँग्रेस": "Nepali Congress",
    "राष्ट्रिय स्वतन्त्र पार्टी": "Rastriya Swatantra Party",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "CPN (Unified Marxist-Leninist)",
    "राष्ट्रिय प्रजातन्त्र पार्टी": "Rastriya Prajatantra Party",
    "नेपाल कम्युनिस्ट पार्टी (माओवादी)": "Nepal Communist Party (Maoist Centre)",
    "जनता समाजवादी पार्टी, नेपाल": "Janata Samajbadi Party, Nepal",
    "जनमत पार्टी": "Janamat Party",
    "नागरिक उन्मुक्ति पार्टी, नेपाल(एकल चुनाव चिन्ह)": "Nagarik Unmukti Party",
    "नेपाल मजदुर किसान पार्टी": "Nepal Majdoor Kishan Party",
    "राष्ट्रिय जनमोर्चा": "Rastriya Janamorcha",
    "श्रम संस्कृति पार्टी": "Shram Sanskriti Party",
    "मंगोल नेशनल अर्गनाइजेसन": "Mongol National Organisation",
    "नेपाल जनमुक्ति पार्टी": "Nepal Janamukti Party",
    "नेपाल जनता पार्टी": "Nepal Janata Party",
    "बहुजन शक्ति पार्टी": "Bahujan Shakti Party",
    "संघीय लोकतान्त्रिक राष्ट्रिय मञ्च": "Sanghiya Loktantrik Rastriya Manch",
    "नेपाल सद्भावना पार्टी": "Nepal Sadbhavana Party",
    "युनाईटेड नेपाल डिमोक्रयाटीक पार्टी": "United Nepal Democratic Party",
    "आम जनता पार्टी(एकल चुनाव चिन्ह)": "Aam Janata Party",
    "नेपाली कम्युनिष्ट पार्टी": "Nepali Communist Party",
    "नेपाल कम्युनिष्ट पार्टी (संयुक्त)": "Nepal Communist Party (United)",
    "नेपाल कम्युनिष्ट पार्टी (माक्र्सवादी)(एकल चुनाव चिन्ह)": "Nepal Communist Party (Marxist)",
};

function normalizePartyName(value: string): string {
    return value
        .normalize("NFKC")
        .toLowerCase()
        .replace(/\(\s*एकल\s*चुनाव\s*चिन्ह\s*\)/g, " ")
        .replace(/[()]/g, " ")
        .replace(/[,:.]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function createOfficialRankMap(parties: PartyDTO[]): Map<string, number> {
    const ranks = new Map<string, number>();

    for (const party of parties) {
        const overallRank = Number(party.ranking?.overall);
        if (!Number.isFinite(overallRank) || overallRank <= 0) continue;

        const keys = [party.name, party.shortName].filter(Boolean) as string[];
        for (const key of keys) {
            const normalized = normalizePartyName(key);
            const current = ranks.get(normalized);
            if (!current || overallRank < current) {
                ranks.set(normalized, overallRank);
            }
        }
    }

    return ranks;
}

function createAliasRankMap(officialRanks: Map<string, number>): Map<string, number> {
    const aliasRanks = new Map<string, number>();

    for (const [aliasName, officialName] of Object.entries(PARTY_ALIAS_TO_OFFICIAL)) {
        const officialRank = officialRanks.get(normalizePartyName(officialName));
        if (!officialRank) continue;
        aliasRanks.set(normalizePartyName(aliasName), officialRank);
    }

    return aliasRanks;
}

export function buildFPTPPartyRankIndex(
    dataset: FPTPCandidateDataset,
    parties: PartyDTO[]
): PartyRankIndex {
    const officialRanks = createOfficialRankMap(parties);
    const aliasRanks = createAliasRankMap(officialRanks);

    const counts = new Map<string, number>();
    for (const candidate of dataset.candidates) {
        counts.set(candidate.partyName, (counts.get(candidate.partyName) || 0) + 1);
    }

    const index: PartyRankIndex = {};
    const fallbackEntries: Array<{ partyName: string; count: number }> = [];

    const officialMax = Math.max(0, ...Array.from(officialRanks.values()));

    for (const [partyName, count] of counts.entries()) {
        const normalized = normalizePartyName(partyName);
        const rank = officialRanks.get(normalized) || aliasRanks.get(normalized);

        if (rank) {
            index[partyName] = {
                rank,
                source: "official",
            };
            continue;
        }

        fallbackEntries.push({ partyName, count });
    }

    fallbackEntries
        .sort((a, b) => b.count - a.count || a.partyName.localeCompare(b.partyName, "ne"))
        .forEach((entry, idx) => {
            index[entry.partyName] = {
                rank: officialMax + idx + 1,
                source: "fallback",
            };
        });

    return index;
}

export function buildPartyRankIndexForNames(
    partyNames: string[],
    parties: PartyDTO[]
): PartyRankIndex {
    const officialRanks = createOfficialRankMap(parties);
    const aliasRanks = createAliasRankMap(officialRanks);
    const uniquePartyNames = Array.from(new Set(partyNames.filter(Boolean)));

    const index: PartyRankIndex = {};
    const fallbackPartyNames: string[] = [];
    const officialMax = Math.max(0, ...Array.from(officialRanks.values()));

    for (const partyName of uniquePartyNames) {
        const normalized = normalizePartyName(partyName);
        const rank = officialRanks.get(normalized) || aliasRanks.get(normalized);

        if (rank) {
            index[partyName] = {
                rank,
                source: "official",
            };
            continue;
        }

        fallbackPartyNames.push(partyName);
    }

    fallbackPartyNames
        .sort((a, b) => a.localeCompare(b, "ne"))
        .forEach((partyName, idx) => {
            index[partyName] = {
                rank: officialMax + idx + 1,
                source: "fallback",
            };
        });

    return index;
}
