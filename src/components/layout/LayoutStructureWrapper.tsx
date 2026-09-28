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
    { href: "/leaders", label: { en: "Leaders", ne: "नेताहरू" } },
    { href: "/articles", label: { en: "Articles", ne: "लेखहरू" } },
    { href: "/coverage", label: { en: "Coverage", ne: "कभरेज" } },
    { href: "/history", label: { en: "History", ne: "इतिहास" } },
];

const GLOBAL_PAGE_LINKS: UniversalSidebarLink[] = [
    { href: "/", label: { en: "Home", ne: "गृहपृष्ठ" } },
    { href: "/leaders", label: { en: "Leaders", ne: "नेताहरू" } },
    { href: "/history", label: { en: "History", ne: "इतिहास" } },
    { href: "/articles", label: { en: "Articles", ne: "लेखहरू" } },
    { href: "/coverage", label: { en: "Coverage", ne: "कभरेज" } },
    { href: "/about", label: { en: "About Us", ne: "हाम्रा बारेमा" } },
    { href: "/contact", label: { en: "Contact", ne: "सम्पर्क" } },
];

const DEFAULT_RESOURCE_LINKS: UniversalSidebarResourceLink[] = [
    { href: "/coverage", label: { en: "Coverage", ne: "कभरेज" } },
    { href: "/leaders", label: { en: "Leader Profiles", ne: "नेता प्रोफाइल" } },
    { href: "/articles", label: { en: "Articles", ne: "लेखहरू" } },
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

    const sidebarLinks = useMemo(() => {
        if (isHomePage) return HOME_SECTION_LINKS;
        return GLOBAL_PAGE_LINKS;
    }, [isHomePage]);

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
