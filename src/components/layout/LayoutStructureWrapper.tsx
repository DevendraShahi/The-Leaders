'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import {
    UniversalSidebar,
    type UniversalSidebarLink,
    type UniversalSidebarResourceLink,
} from "@/components/common/universal-sidebar";

const HOME_SECTION_LINKS: UniversalSidebarLink[] = [
    { href: "#home-section-1", label: { en: "Countdown & Election Date", ne: "काउन्टडाउन र निर्वाचन मिति" } },
    { href: "#home-section-2", label: { en: "Snapshot, Briefs & Fact Checks", ne: "स्न्यापशट, ब्रिफ र तथ्य-जाँच" } },
    { href: "#home-section-3", label: { en: "Leader Profiles", ne: "नेता प्रोफाइलहरू" } },
    { href: "#home-section-4", label: { en: "Latest Coverage", ne: "ताजा समाचार कवरेज" } },
    { href: "#home-section-5", label: { en: "Manifesto Explorer", ne: "घोषणापत्र एक्सप्लोरर" } },
    { href: "#home-section-6", label: { en: "Historical Timeline", ne: "ऐतिहासिक समयरेखा" } },
];

const GLOBAL_PAGE_LINKS: UniversalSidebarLink[] = [
    { href: "/", label: { en: "Home", ne: "गृहपृष्ठ" } },
    { href: "/leaders", label: { en: "Leaders", ne: "नेताहरू" } },
    { href: "/history", label: { en: "History", ne: "इतिहास" } },
    { href: "/election-2026", label: { en: "Election 2026", ne: "निर्वाचन २०२६" } },
    { href: "/articles", label: { en: "Articles", ne: "लेखहरू" } },
    { href: "/about", label: { en: "About Us", ne: "हाम्रा बारेमा" } },
    { href: "/contact", label: { en: "Contact", ne: "सम्पर्क" } },
];

const ELECTION_PAGE_LINKS: UniversalSidebarLink[] = [
    { href: "/election-2026", label: { en: "Election Dashboard", ne: "निर्वाचन ड्यासबोर्ड" } },
    { href: "/election-2026/snapshot", label: { en: "Snapshot Data", ne: "स्न्यापशट डेटा" } },
    { href: "/election-2026/daily-brief", label: { en: "Daily Brief", ne: "दैनिक ब्रिफ" } },
    { href: "/election-2026/fact-checks", label: { en: "Fact Checks", ne: "तथ्य-जाँच" } },
    { href: "/election-2026/analyses", label: { en: "Analyses", ne: "विश्लेषण" } },
    { href: "/election-2026/profiles", label: { en: "Profiles", ne: "प्रोफाइलहरू" } },
    { href: "/election-2026/parties", label: { en: "Parties", ne: "पार्टीहरू" } },
    { href: "/election-2026/pr-candidates", label: { en: "PR Candidates", ne: "समानुपातिक उम्मेदवार" } },
    { href: "/election-2026/timeline", label: { en: "Timeline", ne: "समयरेखा" } },
];

const DEFAULT_RESOURCE_LINKS: UniversalSidebarResourceLink[] = [
    { href: "/election-2026", label: { en: "Election Hub", ne: "निर्वाचन हब" } },
    { href: "/leaders", label: { en: "Leader Profiles", ne: "नेता प्रोफाइल" } },
    { href: "/articles", label: { en: "Analysis", ne: "विश्लेषण" } },
];

export default function LayoutStructureWrapper({
    children,
    socialLinks = []
}: {
    children: React.ReactNode;
    socialLinks?: any[];
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/api/admin") || pathname?.startsWith("/api/auth");
    const isSidebarEnabled = false;
    const isHomePage = pathname === "/";
    const isElectionRoute = pathname?.startsWith("/election-2026");

    const sidebarLinks = useMemo(() => {
        if (isHomePage) return HOME_SECTION_LINKS;
        if (isElectionRoute) return ELECTION_PAGE_LINKS;
        return GLOBAL_PAGE_LINKS;
    }, [isElectionRoute, isHomePage]);

    const activeSidebarHref = useMemo(() => {
        if (!pathname || isHomePage) return undefined;

        const routeLinks = sidebarLinks
            .map((link) => link.href)
            .filter((href) => !href.startsWith("#"))
            .sort((a, b) => b.length - a.length);

        return routeLinks.find((href) => pathname === href || pathname.startsWith(`${href}/`));
    }, [isHomePage, pathname, sidebarLinks]);

    if (isAdminRoute) {
        return (
            <div className="min-h-screen bg-background">
                {children}
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-[64px] md:pt-[72px]">
                <div className="mx-auto w-full max-w-[1720px] lg:flex lg:items-start lg:px-4">
                    {isSidebarEnabled ? (
                        <>
                            <div className="lg:hidden">
                                <UniversalSidebar
                                    title="The Leaders"
                                    mode="global"
                                    navigationLinks={sidebarLinks}
                                    resourceLinks={DEFAULT_RESOURCE_LINKS}
                                    activeHref={activeSidebarHref}
                                />
                            </div>

                            <aside className="hidden lg:block lg:w-[272px] lg:flex-none xl:w-[304px]">
                                <div className="sticky top-[72px] h-[calc(100dvh-72px)]">
                                    <UniversalSidebar
                                        title="The Leaders"
                                        mode="global"
                                        className="h-full"
                                        navigationLinks={sidebarLinks}
                                        resourceLinks={DEFAULT_RESOURCE_LINKS}
                                        activeHref={activeSidebarHref}
                                    />
                                </div>
                            </aside>
                        </>
                    ) : null}

                    <div className="min-w-0 flex-1">
                        {children}
                    </div>
                </div>
            </main>
            <Footer socialLinks={socialLinks} />
        </>
    );
}
