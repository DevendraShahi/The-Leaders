import { getArticles } from "@/lib/data";
import { ArticlesShell } from "@/components/articles/ArticlesShell";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata({
    title: "Articles",
    description: "Read the latest political news, analysis, and perspectives from The Leaders of Nepal.",
    canonical: "/articles",
    keywords: ["Nepal politics articles", "Nepal political analysis", "The Leaders articles"],
});

export const revalidate = 3600;

export default async function ArticlesPage() {
    // In a real app we might verify if limit is needed or pagination
    const articles = await getArticles(30);

    return <ArticlesShell articles={articles} />;
}
