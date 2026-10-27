import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import { getNplTeamsData, getNplFixtures } from "@/lib/npl-data";
import { nplTeamIds } from "@/lib/post-studio/cricket-catalog";
import { NplTeamProfileClient } from "@/components/npl/NplTeamProfileClient";

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export async function generateStaticParams() {
  return nplTeamIds.map((id) => ({
    teamId: id,
  }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const teams = getNplTeamsData();
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return {
      title: "Team Not Found | The Leaders",
    };
  }

  const title = `${team.name} (${team.nameNe}) | NPL 2026 Squad, Players & Schedule | The Leaders`;
  const description = `Complete official roster, player statistics, coaching staff, and match fixtures for ${team.name} in Nepal Premier League (NPL) Season 3 (2026). Captain: ${team.captain}, Marquee: ${team.marqueePlayer}.`;

  return constructMetadata({
    title,
    description,
    canonical: `/npl/teams/${team.id}`,
    ogImage: team.logo,
    ogImageType: "image/png",
    keywords: [
      team.name,
      team.nameNe,
      `${team.name} squad`,
      `${team.name} players`,
      `${team.name} NPL 2026`,
      team.captain,
      team.marqueePlayer,
      "Nepal Premier League",
      "NPL Season 3",
    ],
  });
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const teams = getNplTeamsData();
  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    notFound();
  }

  const fixtures = getNplFixtures().filter(
    (f) => f.teamId === team.id || f.opponentId === team.id
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    alternateName: team.nameNe,
    url: `https://theleaders.com.np/npl/teams/${team.id}`,
    logo: `https://theleaders.com.np${team.logo}`,
    sport: "Cricket",
    coach: {
      "@type": "Person",
      name: team.coach,
    },
    athlete: team.players.map((p) => ({
      "@type": "Person",
      name: p.name,
      jobTitle: p.role,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NplTeamProfileClient
        team={team}
        allTeams={teams}
        fixtures={fixtures}
      />
    </>
  );
}
