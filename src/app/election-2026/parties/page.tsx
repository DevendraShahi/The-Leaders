import PartyData from "@/data/registered-parties-2026EC.json";
import { PartyDTO } from "@/lib/election-data";
import { PartiesClient } from "./PartiesClient";

// Type assertion since JSON import might be loose
const PARTIES_DATA = PartyData.parties as unknown as PartyDTO[];

export const metadata = {
    title: "Political Parties | Election 2026",
    description: "Browse and analyze all registered political parties for the 2026 General Election.",
};

export default function PartiesPage() {
    return <PartiesClient parties={PARTIES_DATA} />;
}
