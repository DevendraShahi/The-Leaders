import { getLeaders } from "@/lib/leaders-db";
import LeaderAccordionSlider from "@/components/leaders/LeaderAccordionSlider";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Leaders Gallery",
    description: "Explore Nepal's political leaders in an immersive gallery view. An independent digital archive documenting Nepal's political leaders, democratic history, and civic legacy.",
    canonical: "/leaders",
    keywords: ["Nepal leaders gallery", "political leader profiles Nepal", "Nepal political history"],
});

export const revalidate = 3600;

export default async function LeadersPage() {
    const leaders = await getLeaders();
    return <LeaderAccordionSlider leaders={leaders} />;
}
