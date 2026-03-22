
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "About The Leaders Nepal (LeadersNP)",
    description: "Learn about The Leaders Nepal (LeadersNP), our editorial mission, and how we document Nepal's political leadership and democratic history.",
    canonical: "/about",
    keywords: ["about leadersnp", "about the leaders nepal", "Nepal political archive mission"],
});

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
