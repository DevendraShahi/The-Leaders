import type { Metadata } from "next";
import { Manrope, Bebas_Neue, Hind, Lora } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
});

const bebas = Bebas_Neue({
    variable: "--font-bebas",
    weight: "400",
    subsets: ["latin"],
});

const hind = Hind({
    variable: "--font-hind",
    subsets: ["devanagari", "latin"],
    weight: ["300", "400", "500", "600", "700"],
});

const lora = Lora({
    variable: "--font-lora",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const knight = localFont({
    src: "../../public/fonts/KnightWarrior.otf",
    variable: "--font-knight",
});

import { constructMetadata } from "@/lib/metadata";



import { ThemeProvider } from "@/components/theme-provider";
import { GlobalLoadingProvider } from "@/components/providers/global-loading-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import CodePenCursor from "@/components/ui/code-pen-cursor";


// ... existing imports

import { headers } from "next/headers";
import { getSettings } from "@/lib/maintenance-check";
import MaintenanceGuard from "@/components/layout/MaintenanceGuard";
import LayoutStructureWrapper from "@/components/layout/LayoutStructureWrapper";
import { Toaster } from "@/components/ui/sonner";
import ViewTracker from "@/components/analytics/ViewTracker";

// ... existing imports

export async function generateMetadata() {
    const settings = await getSettings();
    const defaultDescription = "An independent digital archive documenting Nepal's political leaders, democratic history, election intelligence, and civic legacy. Also known as LeadersNP.";
    const configuredDescription = settings?.siteDescription?.en?.trim() || defaultDescription;
    const enrichedDescription = /leadersnp/i.test(configuredDescription)
        ? configuredDescription
        : `${configuredDescription} Also known as LeadersNP.`;
    const configuredKeywords = Array.isArray(settings?.metaKeywords) && settings?.metaKeywords.length > 0
        ? settings.metaKeywords
        : [
            "political biography",
            "Nepal history",
            "democratic leadership",
            "Nepal Congress party",
            "election 2026",
            "Nepal manifesto",
        ];
    const keywordSet = new Set([
        ...configuredKeywords,
        "leadersnp",
        "leaders np",
        "The Leaders Nepal",
        "Nepal political leaders",
        "Nepal election analysis",
    ]);

    return constructMetadata({
        title: settings?.siteName?.en || "The Leaders",
        description: enrichedDescription,
        keywords: Array.from(keywordSet),
        icons: settings?.faviconUrl ? {
            icon: settings.faviconUrl,
            shortcut: settings.faviconUrl,
            apple: settings.faviconUrl,
        } : undefined
    });
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch settings for client-side maintenance check & social links
    const settings = await getSettings();
    const maintenanceSettings = settings?.maintenance || null;
    const socialLinks = settings?.socialLinks || [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-leadersnp.com";
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const facebookDomainVerification = process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION;
    const sameAs = (socialLinks || [])
        .map((item: any) => item?.url)
        .filter((url: string) => typeof url === "string" && /^https?:\/\//.test(url));
    const organizationJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "The Leaders",
        alternateName: ["LeadersNP", "The Leaders Nepal", "leadersnp"],
        description: "Independent civic archive and election intelligence platform focused on Nepal's political leadership, democracy, and public history.",
        url: siteUrl,
        logo: `${siteUrl}/logo.svg`,
        sameAs,
    };
    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "The Leaders",
        alternateName: ["LeadersNP", "leadersnp"],
        url: siteUrl,
        inLanguage: ["en", "ne"],
        publisher: {
            "@id": `${siteUrl}/#organization`,
        },
    };

    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <head>
                {facebookAppId ? <meta property="fb:app_id" content={facebookAppId} /> : null}
                {facebookDomainVerification ? (
                    <meta name="facebook-domain-verification" content={facebookDomainVerification} />
                ) : null}
                <script defer src="https://cloud.umami.is/script.js" data-website-id="0bb523e8-e03b-451a-9d6a-fea47d96e5f2"></script>
            </head>
            <body
                className={`${manrope.variable} ${bebas.variable} ${hind.variable} ${lora.variable} ${knight.variable} antialiased bg-background text-foreground`}
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />
                <CodePenCursor />
                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LanguageProvider>
                        <GlobalLoadingProvider>
                            <ViewTracker />
                            <MaintenanceGuard maintenanceSettings={maintenanceSettings}>
                                <LayoutStructureWrapper socialLinks={socialLinks}>
                                    {children}
                                </LayoutStructureWrapper>
                            </MaintenanceGuard>
                            <Toaster position="bottom-right" />
                        </GlobalLoadingProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </body>
        </html >
    );
}
