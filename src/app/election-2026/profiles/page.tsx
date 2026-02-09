import { getParties } from "@/lib/election-data";
import { ProfilesClient } from "./ProfilesClient";

export default async function ElectionProfiles() {
    const parties = await getParties();

    return <ProfilesClient parties={parties} />;
}
