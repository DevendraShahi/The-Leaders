import type { Metadata } from "next";
import { Manrope, Bebas_Neue, Hind } from "next/font/google";
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

// ... existing imports

export async function generateMetadata() {
    const settings = await getSettings();

    return constructMetadata({
        title: settings?.siteName?.en || "The Leaders",
        description: settings?.siteDescription?.en || "A comprehensive digital platform showcasing the life, achievements, and political legacy of Rt. Hon. Sher Bahadur Deuba.",
        canonical: "/",
        keywords: settings?.metaKeywords || [
            "political biography",
            "Nepal history",
            "democratic leadership",
            "Nepal Congress party",
            "election 2026",
            "Nepal manifesto",
        ],
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

    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body
                className={`${manrope.variable} ${bebas.variable} ${hind.variable} ${knight.variable} antialiased bg-background text-foreground`}
            >
                <CodePenCursor />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LanguageProvider>
                        <GlobalLoadingProvider>
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
