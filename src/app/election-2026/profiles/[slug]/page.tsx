import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Flag, Globe, ImageIcon, Landmark, MapPin, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { constructMetadata } from "@/lib/metadata";
import { findFPTPCandidateBySlug, getFPTPCandidateSlug } from "@/lib/candidate-slug";
import { getFPTPCandidateDataset } from "@/lib/fptp-candidate-data";
import { getParties } from "@/lib/election-data";
import { buildFPTPPartyRankIndex } from "@/lib/fptp-party-ranking";

interface CandidateProfilePageProps {
    params: Promise<{ slug: string }>;
}

const GENDER_TO_EN: Record<string, string> = {
    पुरुष: "Male",
    महिला: "Female",
    अन्य: "Other",
};

function valueOrDash(value: unknown): string {
    if (value === null || value === undefined) return "-";
    const text = String(value).trim();
    if (!text || text.toLowerCase() === "null" || text === "-") return "-";
    return text;
}

function resolvedGender(raw: string): string {
    return GENDER_TO_EN[raw] || raw || "-";
}

async function getCandidateFromParams(params: Promise<{ slug: string }>) {
    const { slug } = await params;
    const [dataset, parties] = await Promise.all([
        getFPTPCandidateDataset(),
        getParties(),
    ]);
    const candidate = findFPTPCandidateBySlug(dataset.candidates, slug);
    const partyRankIndex = buildFPTPPartyRankIndex(dataset, parties);
    const partyRank = candidate ? partyRankIndex[candidate.partyName]?.rank ?? null : null;

    return { slug, candidate, partyRank };
}

export async function generateMetadata({ params }: CandidateProfilePageProps): Promise<Metadata> {
    const { slug, candidate } = await getCandidateFromParams(params);

    if (!candidate) {
        return constructMetadata({
            title: "Candidate Not Found",
            description: "The requested candidate profile could not be found.",
            canonical: `/election-2026/profiles/${slug}`,
            noIndex: true,
        });
    }

    return constructMetadata({
        title: `${candidate.candidateName} Candidate Profile`,
        description: `${candidate.partyName} candidate from ${candidate.district}${candidate.constituency !== null ? ` constituency ${candidate.constituency}` : ""}.`,
        canonical: `/election-2026/profiles/${getFPTPCandidateSlug(candidate)}`,
        ogType: "profile",
        ogImage: candidate.imageUrl || "/the-leader.png",
        keywords: [
            "Nepal election candidate",
            candidate.candidateName,
            candidate.partyName,
            candidate.district,
        ].filter(Boolean),
    });
}

export const revalidate = 3600;

export default async function CandidateProfilePage({ params }: CandidateProfilePageProps) {
    const { candidate, partyRank } = await getCandidateFromParams(params);

    if (!candidate) {
        notFound();
    }

    const details = candidate.details;

    const profileSummary = [
        { label: "Gender", value: resolvedGender(candidate.gender), icon: UserCircle2 },
        { label: "Age", value: valueOrDash(candidate.age), icon: BadgeCheck },
        { label: "Province", value: valueOrDash(candidate.province), icon: Globe },
        { label: "District", value: valueOrDash(candidate.district), icon: MapPin },
        {
            label: "Constituency",
            value: candidate.constituency === null ? "-" : String(candidate.constituency),
            icon: Landmark,
        },
        { label: "Party Symbol", value: valueOrDash(candidate.symbolName), icon: Flag },
    ];

    const personalDetails = [
        { label: "Birth District", value: valueOrDash(details.birthDistrict) },
        { label: "Current Address", value: valueOrDash(details.address) },
        { label: "Father's Name", value: valueOrDash(details.fatherName) },
        { label: "Spouse Name", value: valueOrDash(details.spouseName) },
    ];

    const candidacyDetails = [
        { label: "Election Status", value: valueOrDash(details.electionStatus) },
        { label: "Party Rank", value: valueOrDash(partyRank) },
        { label: "Qualification", value: valueOrDash(details.qualification) },
        { label: "Institution", value: valueOrDash(details.institution) },
    ];

    return (
        <div className="election-typography min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-4">
                    <Button variant="outline" className="rounded-none" asChild>
                        <Link href="/election-2026/profiles">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back To Candidates
                        </Link>
                    </Button>
                    <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase tracking-widest">
                        FPTP Candidate Profile
                    </Badge>
                </div>

                <section className="grid gap-6 lg:grid-cols-5">
                    <Card className="overflow-hidden rounded-none border border-border/70 lg:col-span-2">
                        <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-muted/25 to-background/40 p-3">
                            {candidate.imageUrl ? (
                                <img
                                    src={candidate.imageUrl}
                                    alt={candidate.candidateName}
                                    className="h-full w-full object-contain object-center"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <ImageIcon className="h-10 w-10" />
                                    <span className="text-xs uppercase tracking-widest">No Photo</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="rounded-none border border-border/70 lg:col-span-3">
                        <CardHeader className="border-b border-border/60 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="rounded-none">{candidate.partyName}</Badge>
                                <Badge variant="outline" className="rounded-none">{valueOrDash(candidate.symbolName)}</Badge>
                            </div>
                            <CardTitle className="pt-1 font-sans text-3xl leading-tight tracking-tight">
                                {candidate.candidateName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {candidate.district}
                                {candidate.constituency !== null && (
                                    <> · Constituency {candidate.constituency}</>
                                )}
                            </p>
                        </CardHeader>
                        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                            {profileSummary.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div key={item.label} className="rounded-none border border-border/60 bg-muted/10 p-3">
                                        <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                                            <Icon className="h-3.5 w-3.5" />
                                            {item.label}
                                        </p>
                                        <p className="mt-1.5 text-sm font-medium text-foreground">{item.value}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-none border border-border/70">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="text-lg">Personal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            {personalDetails.map((item) => (
                                <div key={item.label} className="border-b border-dashed border-border/60 pb-3 last:border-b-0 last:pb-0">
                                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{item.label}</p>
                                    <p className="mt-1 text-sm text-foreground">{item.value}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border border-border/70">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="text-lg">Candidacy Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            {candidacyDetails.map((item) => (
                                <div key={item.label} className="border-b border-dashed border-border/60 pb-3 last:border-b-0 last:pb-0">
                                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{item.label}</p>
                                    <p className="mt-1 text-sm text-foreground">{item.value}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-none border border-border/70">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="text-lg">Education & Institution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            <div>
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Highest Qualification</p>
                                <p className="mt-1 text-sm text-foreground">{valueOrDash(details.qualification)}</p>
                            </div>
                            <div className="border-t border-dashed border-border/60 pt-3">
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Institution</p>
                                <p className="mt-1 text-sm text-foreground">{valueOrDash(details.institution)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-none border border-border/70">
                        <CardHeader className="border-b border-border/60 pb-3">
                            <CardTitle className="text-lg">Experience & Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-4">
                            <div>
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Experience</p>
                                <p className="mt-1 text-sm text-foreground">{valueOrDash(details.experience)}</p>
                            </div>
                            <div className="border-t border-dashed border-border/60 pt-3">
                                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Other Details</p>
                                <p className="mt-1 text-sm text-foreground">{valueOrDash(details.otherDetails)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-none border border-border/70 bg-muted/10">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="space-y-1">
                            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Data Source</p>
                            <p className="text-sm text-foreground">Election Commission of Nepal (official candidate profile feed)</p>
                        </div>
                        {candidate.imageUrl && (
                            <Button variant="outline" className="rounded-none" asChild>
                                <Link href={candidate.imageUrl} target="_blank" rel="noopener noreferrer">
                                    Open Original Image
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
