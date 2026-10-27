import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/metadata";
import {
  getAllNplPlayers,
  getNplPlayerById,
  getNplFixtures,
  nplTournamentMeta
} from "@/lib/npl-data";
import { getPlayerComputedMeta } from "@/lib/npl-player-meta";
import { NplPlayerProfileClient } from "@/components/npl/NplPlayerProfileClient";
import { absoluteUrl } from "@/lib/seo";

interface PlayerPageProps {
  params: Promise<{
    playerId: string;
  }>;
}

export async function generateStaticParams() {
  const players = getAllNplPlayers();
  return players.map((p) => ({
    playerId: p.id,
  }));
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const data = getNplPlayerById(playerId);

  if (!data) {
    return {
      title: "Player Not Found | The Leaders",
    };
  }

  const { player, team } = data;
  const title = `${player.name} (${player.nameNe}) | ${team.name} NPL 2026 Profile, Stats & Card | The Leaders`;
  const description = `${player.name} official profile for ${team.name} in Nepal Premier League (NPL) Season 3. Role: ${player.role}, Origin: ${player.origin}, Category: ${player.category}. Career stats, match schedule, and dossier.`;

  return constructMetadata({
    title,
    description,
    canonical: `/npl/players/${player.id}`,
    ogImage: player.image.local,
    ogImageType: "image/webp",
    keywords: [
      player.name,
      player.nameNe,
      team.name,
      team.nameNe,
      `${player.name} NPL`,
      `${player.name} stats`,
      player.role,
      "Nepal Premier League",
      "NPL 2026"
    ],
  });
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const data = getNplPlayerById(playerId);

  if (!data) {
    notFound();
  }

  const { player, team } = data;
  const meta = getPlayerComputedMeta(player, team);

  // Franchise match schedule
  const allFixtures = getNplFixtures();
  const teamFixtures = allFixtures.filter(
    (f) => f.teamId === team.id || f.opponentId === team.id
  );

  // Teammates and related stars
  const relatedPlayers = team.players.filter((p) => p.id !== player.id);

  // Schema.org Person JSON-LD
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    alternateName: player.nameNe,
    jobTitle: `${player.role} (${team.name})`,
    description: player.highlights,
    nationality: player.origin,
    image: absoluteUrl(player.image.local),
    url: absoluteUrl(`/npl/players/${player.id}`),
    memberOf: {
      "@type": "SportsTeam",
      name: team.name,
      sport: "Cricket",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <NplPlayerProfileClient
        player={player}
        team={team}
        meta={meta}
        teamFixtures={teamFixtures}
        relatedPlayers={relatedPlayers}
      />
    </>
  );
}
