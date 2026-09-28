import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { HeroMarquee } from "@/components/home/hero-marquee";
import { LeadersGrid } from "@/components/home/LeadersGrid";
import { Timeline } from "@/components/home/timeline";
import { Manifesto } from "@/components/home/manifesto";
import { NewsSection } from "@/components/home/news-section";
import { HomeTasks } from "@/components/home/HomeTasks";
import { HomeScrollEffects } from "@/components/home/HomeScrollEffects";
import { getArticles } from "@/lib/data";

import { constructMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/maintenance-check";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 21600;

const HOME_DEFAULT_DESCRIPTION =
  "The Leaders is Nepal’s archive of political leaders, democratic history, and the news.";

function withLeadersNPAliasInTitle(text: string, fallback: string): string {
  const value = (text || fallback).trim();
  if (/leadersnp/i.test(value)) {
    return value;
  }
  return `${value} | LeadersNP`;
}

function withLeadersNPAliasInDescription(text: string, fallback: string): string {
  const value = (text || fallback).trim();
  if (/leadersnp/i.test(value)) {
    return value;
  }
  return `${value} Also known as LeadersNP.`;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const rawTitle = settings?.siteName?.en?.trim() || "The Leaders";
  const rawDescription = settings?.siteDescription?.en?.trim() || HOME_DEFAULT_DESCRIPTION;
  const configuredKeywords =
    Array.isArray(settings?.metaKeywords) && settings?.metaKeywords.length > 0
      ? settings.metaKeywords
      : [];
  const keywords = Array.from(
    new Set([
      ...configuredKeywords,
      "leadersnp",
      "leaders np",
      "The Leaders Nepal",
      "Nepal political leaders",
      "Nepal news",
      "Nepal democracy archive",
      "Nepal history",
    ])
  );

  return constructMetadata({
    title: withLeadersNPAliasInTitle(rawTitle, "The Leaders Nepal"),
    description: withLeadersNPAliasInDescription(rawDescription, HOME_DEFAULT_DESCRIPTION),
    canonical: "/",
    ogImage: "/og/facebook-og.jpg",
    ogImageType: "image/jpeg",
    keywords,
  });
}

export default async function Home() {
  const articles = await getArticles(3);
  const homePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/#webpage"),
    url: absoluteUrl("/"),
    name: "LeadersNP | The Leaders Nepal",
    description: HOME_DEFAULT_DESCRIPTION,
    inLanguage: ["en", "ne"],
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
    about: [
      { "@type": "Thing", name: "Nepal Politics" },
      { "@type": "Thing", name: "Nepal News" },
      { "@type": "Thing", name: "Political Leadership in Nepal" },
    ],
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };

  // Home is a server component; language switching happens client-side.
  // We keep this neutral and let child components handle localization.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageJsonLd) }}
      />
      <HeroMarquee />
      <HomeScrollEffects>
        <Hero />
        <HomeTasks />
        <LeadersGrid />
        <NewsSection articles={articles} />
        <Manifesto />
        <Timeline limit={2} showViewAll={true} />
      </HomeScrollEffects>
    </>
  );
}
