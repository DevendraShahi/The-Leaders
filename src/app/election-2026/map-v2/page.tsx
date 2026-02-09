import { MapV2Client } from "./MapV2Client";

export const metadata = {
    title: "Interactive Election Map V2 | The Leaders",
    description: "Advanced interactive visualization of Nepal's electoral districts and provinces.",
};

export default function MapV2Page() {
    return <MapV2Client />;
}
