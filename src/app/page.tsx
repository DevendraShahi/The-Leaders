import type { Metadata } from "next";
import { NplWelcomePopup } from '@/components/home/NplWelcomePopup';
import { NplHomeWidget } from "@/components/home/NplHomeWidget";
import { getArticles } from "@/lib/data";
import { getLeaders } from "@/lib/leaders-db";
import { getLiveAndArchivalDispatches, getInvestigativeReports, getOpinionColumns, SOURCE_DISPLAY_MAP } from "@/lib/news-feed";
import { NewsMasthead } from "@/components/home/NewsMasthead";
import { NewsFrontPage } from "@/components/home/NewsFrontPage";
import { NewsArchiveSpotlight } from "@/components/home/NewsArchiveSpotlight";
import { NewsInvestigativeGrid } from "@/components/home/NewsInvestigativeGrid";
import { NewsOpinionSection } from "@/components/home/NewsOpinionSection";
import { NewsOnThisDay } from "@/components/home/NewsOnThisDay";
import { NewsNewsletterBriefing } from "@/components/home/NewsNewsletterBriefing";

import { constructMetadata } from "@/lib/metadata";
import { getSettings } from "@/lib/maintenance-check";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300; // 5-minute revalidation for fresh breaking wire

const HOME_DEFAULT_DESCRIPTION =
  "The Leaders is Nepal’s archive of political leaders, democratic history, and editorial investigations.";

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
      "Nepal investigative journalism",
      "Nepal politics",
      "Constitutional history of Nepal",
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
  const [articles, leaders, dispatches, investigativeReports, opinionColumns] = await Promise.all([
    getArticles(12).catch(() => []),
    getLeaders().catch(() => []),
    getLiveAndArchivalDispatches(12).catch(() => []),
    getInvestigativeReports(6).catch(() => []),
    getOpinionColumns(3).catch(() => []),
  ]);

  const leadArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);
  const investigativeArticles = articles.slice(4);

  // Construct dynamic ticker items with real-time breaking Nepal news and archival dispatches
  const tickerItems = [
    ...dispatches.map((d) => {
      const srcName = d.source || "OnlineKhabar";
      const srcMeta = SOURCE_DISPLAY_MAP[srcName] || { en: srcName, ne: srcName };
      const srcEn = srcMeta.en.toUpperCase();
      const srcNe = srcMeta.ne;

      return {
        title: d.title,
        link: d.link || "/articles",
        tag: d.isLiveFeed 
          ? { en: `WIRE · ${srcEn}`, ne: `ताजा तार · ${srcNe}` }
          : { en: "ARCHIVE BRIEF", ne: "अभिलेख ब्रिफ" },
      };
    }),
    ...articles.slice(0, 3).map((a) => ({
      title: a.title,
      link: `/articles/${a.slug}`,
      tag: a.category || "INVESTIGATION",
    })),
  ];

  const homePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/#webpage"),
    url: absoluteUrl("/"),
    name: "The Leaders | Nepal’s Political & Democratic Journalism Archive",
    description: HOME_DEFAULT_DESCRIPTION,
    inLanguage: ["en", "ne"],
    isPartOf: {
      "@id": absoluteUrl("/#website"),
    },
    about: [
      { "@type": "Thing", name: "Nepal Politics" },
      { "@type": "Thing", name: "Nepal News" },
      { "@type": "Thing", name: "Democratic Leadership in Nepal" },
      { "@type": "Thing", name: "Constitutional Governance" },
    ],
    publisher: {
      "@id": absoluteUrl("/#organization"),
    },
  };

  const newsOrgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": absoluteUrl("/#organization"),
    name: "The Leaders",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.svg"),
    sameAs: [
      "https://facebook.com/theleadersnp",
      "https://twitter.com/theleadersnp"
    ],
    publishingPrinciples: absoluteUrl("/about"),
    diversityPolicy: absoluteUrl("/about"),
    ethicsPolicy: absoluteUrl("/about")
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsOrgJsonLd) }}
      />
      <NplWelcomePopup />
      <div className="w-full bg-background">
        {/* Masthead, Live Dateline & Wire Ticker */}
        <NewsMasthead tickerItems={tickerItems} />

        {/* Front Page Broadsheet: Lead Story, Top Stories & 24h Wire Dispatch */}
        <NewsFrontPage 
          leadArticle={leadArticle} 
          secondaryArticles={secondaryArticles} 
          briefs={dispatches} 
        />

        {/* Archival Statesmen Spotlight */}
        <NewsArchiveSpotlight leaders={leaders} />

        {/* In-Depth Policy & Investigative Reporting Grid */}
        <NewsInvestigativeGrid 
          reports={investigativeReports}
          articles={investigativeArticles.length >= 3 ? investigativeArticles : articles} 
        />

        {/* Nepal Premier League 2026 Live Hub & Player Dossiers */}
        <NplHomeWidget />

        {/* Opinion & Editorial Perspectives from Scholars & Columnists */}
        <NewsOpinionSection opinions={opinionColumns} />

        {/* Chronicles of Democracy: Pivotal Historic Milestones */}
        <NewsOnThisDay />

        {/* The Leaders Morning Dispatch Briefing Subscription */}
        <NewsNewsletterBriefing />
      </div>
    </>
  );
}
