
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Contact The Leaders Nepal (LeadersNP)",
    description: "Contact The Leaders Nepal (LeadersNP) editorial and support team for inquiries, partnerships, and feedback.",
    canonical: "/contact",
    keywords: ["contact leadersnp", "the leaders nepal contact", "nepal political media contact"],
});

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
