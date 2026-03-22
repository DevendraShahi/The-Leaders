
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Accessibility",
    description: "Accessibility commitment and inclusive design practices at The Leaders Nepal (LeadersNP).",
    canonical: "/accessibility",
    keywords: ["leadersnp accessibility", "the leaders nepal accessibility statement"],
});

export default function AccessibilityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
