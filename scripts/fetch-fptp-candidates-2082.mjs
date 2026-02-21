import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CANDIDATES_URL =
  "https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt";
const STATES_URL =
  "https://result.election.gov.np/JSONFiles/Election2082/Local/Lookup/states.json";
const DISTRICTS_URL =
  "https://result.election.gov.np/JSONFiles/Election2082/Local/Lookup/districts.json";
const STATE_NAMES_URL = "https://result.election.gov.np/JSONFiles/StateName.txt";
const DISTRICT_NAMES_URL = "https://result.election.gov.np/JSONFiles/DistrictName.txt";
const PARTY_NAMES_URL =
  "https://result.election.gov.np/JSONFiles/PoliticalPartyName.txt";
const PARTY_NAMES_ALT_URL =
  "https://result.election.gov.np/JSONFiles/PoliticalPartyNew.txt";

const OUTPUT_DIR = path.join(process.cwd(), "public", "election", "candidates");
const OUTPUT_NORMALIZED = path.join(OUTPUT_DIR, "FPTP-2082.json");
const OUTPUT_RAW = path.join(OUTPUT_DIR, "FPTP-2082-raw.json");

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function countBy(items, selector) {
  const counts = new Map();
  for (const item of items) {
    const key = selector(item) || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json,*/*" },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url} (${response.status})`);
  }

  const text = await response.text();
  const withoutBom = text.replace(/^\uFEFF/, "").trim();
  return JSON.parse(withoutBom);
}

function normalizeCandidates(rawCandidates) {
  const mapped = rawCandidates.map((item, index) => {
      const candidateId = toNumber(item.CandidateID);
      const ageFromField = toNumber(item.AGE_YR);
      const ageFromDob = toNumber(item.DOB);

      return {
        sourceSerialNo: index + 1,
        candidateId,
        candidateName: asString(item.CandidateName),
        gender: asString(item.Gender),
        partyName: asString(item.PoliticalPartyName),
        symbolName: asString(item.SymbolName),
        symbolCode: toNumber(item.SYMBOLCODE),
        province: asString(item.StateName),
        provinceId: toNumber(item.STATE_ID),
        district: asString(item.DistrictName),
        constituency: toNumber(item.SCConstID),
        constituencyDisplay: asString(item.ConstName),
        totalVoteReceived: toNumber(item.TotalVoteReceived),
        age: ageFromField ?? ageFromDob,
        details: {
          birthDistrict: asString(item.CTZDIST),
          address: asString(item.ADDRESS),
          fatherName: asString(item.FATHER_NAME),
          spouseName: asString(item.SPOUCE_NAME),
          qualification: asString(item.QUALIFICATION),
          institution: asString(item.NAMEOFINST),
          experience: asString(item.EXPERIENCE),
          otherDetails: asString(item.OTHERDETAILS),
          electionStatus: item.E_STATUS ?? null,
          rank: toNumber(item.R),
        },
        imageUrl: candidateId
          ? `https://result.election.gov.np/Images/Candidate/${candidateId}.jpg`
          : null,
      };
    });

  return mapped
    .sort((a, b) => {
      const districtSort = a.district.localeCompare(b.district);
      if (districtSort !== 0) return districtSort;

      const constituencyA = a.constituency ?? Number.MAX_SAFE_INTEGER;
      const constituencyB = b.constituency ?? Number.MAX_SAFE_INTEGER;
      if (constituencyA !== constituencyB) return constituencyA - constituencyB;

      return a.candidateName.localeCompare(b.candidateName);
    })
    .map((candidate, index) => ({
      ...candidate,
      serialNo: index + 1,
    }));
}

async function main() {
  console.log("Fetching candidate data from Election Commission Nepal...");

  const [
    rawCandidates,
    states,
    districts,
    stateNames,
    districtNames,
    partyNames,
    partyNamesAlt,
  ] = await Promise.all([
    fetchJson(CANDIDATES_URL),
    fetchJson(STATES_URL),
    fetchJson(DISTRICTS_URL),
    fetchJson(STATE_NAMES_URL),
    fetchJson(DISTRICT_NAMES_URL),
    fetchJson(PARTY_NAMES_URL),
    fetchJson(PARTY_NAMES_ALT_URL),
  ]);

  if (!Array.isArray(rawCandidates)) {
    throw new Error("Candidate payload is not an array");
  }

  const candidates = normalizeCandidates(rawCandidates);
  const uniqueParties = new Set(candidates.map((c) => c.partyName).filter(Boolean));
  const uniqueDistricts = new Set(candidates.map((c) => c.district).filter(Boolean));
  const uniqueConstituencyUnits = new Set(
    candidates
      .map((c) => {
        if (!c.district || c.constituency === null) return null;
        return `${c.district}::${c.constituency}`;
      })
      .filter(Boolean)
  );

  const dataset = {
    metadata: {
      electionName: "प्रतिनिधि सभा निर्वाचन, २०८२",
      source: "Election Commission Nepal",
      sourceUrls: {
        candidates: CANDIDATES_URL,
        states: STATES_URL,
        districts: DISTRICTS_URL,
        stateNames: STATE_NAMES_URL,
        districtNames: DISTRICT_NAMES_URL,
        partyNames: PARTY_NAMES_URL,
        partyNamesAlt: PARTY_NAMES_ALT_URL,
      },
      fetchedAt: new Date().toISOString(),
      totalRecords: candidates.length,
    },
    stats: {
      totalCandidates: candidates.length,
      totalParties: uniqueParties.size,
      totalDistricts: uniqueDistricts.size,
      totalConstituencies: uniqueConstituencyUnits.size,
      genderBreakdown: countBy(candidates, (c) => c.gender),
      topParties: countBy(candidates, (c) => c.partyName).slice(0, 20),
      topDistricts: countBy(candidates, (c) => c.district).slice(0, 20),
    },
    lookups: {
      states,
      districts,
      stateNames,
      districtNames,
      partyNames,
      partyNamesAlt,
    },
    candidates,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_NORMALIZED, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  await writeFile(
    OUTPUT_RAW,
    `${JSON.stringify({ source: CANDIDATES_URL, data: rawCandidates }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Saved normalized dataset to ${OUTPUT_NORMALIZED}`);
  console.log(`Saved raw dataset to ${OUTPUT_RAW}`);
  console.log(
    `Candidates: ${dataset.stats.totalCandidates}, Parties: ${dataset.stats.totalParties}, Districts: ${dataset.stats.totalDistricts}`
  );
}

main().catch((error) => {
  console.error("Failed to build 2082 FPTP candidate dataset.");
  console.error(error);
  process.exit(1);
});
