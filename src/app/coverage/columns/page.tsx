import { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getColumnArticles } from "@/lib/election-data";
import { ColumnsClient } from "./ColumnsClient";

export const metadata: Metadata = constructMetadata({
    title: "Columns & Editorials",
    description: "Read in-depth columns, political analysis, and media coverage.",
    canonical: "/coverage/columns",
});

export const revalidate = 21600;

export default async function ColumnsPage() {
    const articles = await getColumnArticles(30);

    return <ColumnsClient articles={articles} />;
}
