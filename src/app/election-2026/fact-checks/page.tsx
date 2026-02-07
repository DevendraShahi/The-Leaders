import { getFactChecks } from "@/lib/election-data";
import { FactChecksPageClient } from "./FactChecksPageClient";

export const revalidate = 60;

export default async function ElectionFactChecks() {
    const factChecks = await getFactChecks();

    return <FactChecksPageClient factChecks={factChecks} />;
}
