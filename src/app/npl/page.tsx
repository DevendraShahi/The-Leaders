import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import {
  getNplTeamsData,
  getAllNplPlayers,
  getNplFixtures,
  getNplPlayoffs,
  getNplStandings,
  nplTournamentMeta
} from "@/lib/npl-data";
import { NplHubClient } from "@/components/npl/NplHubClient";

export const revalidate = 60; // Revalidate published editorial data; this does not fetch a live score feed.

export async function generateMetadata(): Promise<Metadata> {
  const title = "Nepal Premier League (NPL) 2026 | Squads, Fixtures, Standings & Stats | The Leaders";
  const description =
    "Nepal Premier League (NPL) 2026 coverage by The Leaders. Explore 8 franchise squads, player profiles, career statistics, match fixtures, DRS rules, and tournament standings.";

  return constructMetadata({
    title,
    description,
    canonical: "/npl",
    ogImage: "/studio/cricket/npl.png",
    ogImageType: "image/png",
    keywords: [
      "Nepal Premier League",
      "NPL 2026",
      "NPL Season 3",
      "NPL squads",
      "NPL fixtures",
      "NPL players",
      "Biratnagar Kings",
      "Chitwan Rhinos",
      "Janakpur Bolts",
      "Karnali Yaks",
      "Kathmandu Gorkhas",
      "Lumbini Lions",
      "Pokhara Avengers",
      "Sudurpaschim Royals",
      "Cricket Association of Nepal",
      "TU Cricket Ground",
      "David Warner NPL",
      "Shakib Al Hasan NPL",
      "The Leaders cricket",
    ],
  });
}

export default function NplPage() {
  const teams = getNplTeamsData();
  const players = getAllNplPlayers();
  const fixtures = getNplFixtures();
  const playoffs = getNplPlayoffs();
  const standings = getNplStandings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": "Nepal Premier League (NPL) 2026 - Season 3",
    "description": "The official premier franchise Twenty20 cricket tournament organized by the Cricket Association of Nepal (CAN).",
    "startDate": "2026-10-26",
    "endDate": "2026-11-21",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Tribhuvan University International Cricket Ground",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kirtipur",
        "addressRegion": "Kathmandu",
        "addressCountry": "NP"
      }
    },
    "organizer": {
      "@type": "SportsOrganization",
      "name": "Cricket Association of Nepal (CAN)",
      "url": "https://cricketnepal.org.np"
    },
    "sport": "Cricket",
    "competitor": teams.map((t) => ({
      "@type": "SportsTeam",
      "name": t.name,
      "alternateName": t.nameNe,
      "url": t.website,
      "logo": `https://theleaders.com.np${t.logo}`,
      "coach": {
        "@type": "Person",
        "name": t.coach
      },
      "athlete": t.players.map((p) => ({
        "@type": "Person",
        "name": p.name,
        "jobTitle": p.role
      }))
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NplHubClient
        initialNow={new Date().toISOString()}
        teams={teams}
        players={players}
        fixtures={fixtures}
        playoffs={playoffs}
        standings={standings}
      />
    </>
  );
}
