
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Cookie Policy",
    description: "Cookie policy for The Leaders Nepal (LeadersNP), including how cookies are used for analytics and performance.",
    canonical: "/cookie-policy",
    keywords: ["leadersnp cookie policy", "the leaders nepal cookies"],
});

export default function CookiePolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
