import { getPRData } from "@/lib/pr-candidate-data";
import { PRCandidatesClient } from "./PRCandidatesClient";

export default async function PRCandidatesPage() {
    const prData = await getPRData();

    return <PRCandidatesClient prData={prData} />;
}
