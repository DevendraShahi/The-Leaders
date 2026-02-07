import type { Metadata } from "next";
import { Manrope, Bebas_Neue, Anton, Cinzel, Oswald, Six_Caps, Fjalla_One } from "next/font/google";
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

const anton = Anton({
    variable: "--font-anton",
    weight: "400",
    subsets: ["latin"],
});

const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
});

const oswald = Oswald({
    variable: "--font-oswald",
    subsets: ["latin"],
});

const sixCaps = Six_Caps({
    variable: "--font-six-caps",
    weight: "400",
    subsets: ["latin"],
});

const fjalla = Fjalla_One({
    variable: "--font-fjalla",
    weight: "400",
    subsets: ["latin"],
});

const knight = localFont({
    src: "../../public/fonts/KnightWarrior.otf",
    variable: "--font-knight",
});

import { constructMetadata } from "@/lib/metadata";



import { ThemeProvider } from "@/components/theme-provider";
import { FontProvider } from "@/components/font-provider";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { GlobalLoadingProvider } from "@/components/providers/global-loading-provider";
import { Analytics } from "@vercel/analytics/next";

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
                className={`${manrope.variable} ${bebas.variable} ${anton.variable} ${cinzel.variable} ${oswald.variable} ${sixCaps.variable} ${fjalla.variable} ${knight.variable} antialiased bg-background text-foreground`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <FontProvider>
                        <GlobalLoadingProvider>
                            <MaintenanceGuard maintenanceSettings={maintenanceSettings}>
                                <CustomCursor />
                                <LayoutStructureWrapper socialLinks={socialLinks}>
                                    {children}
                                </LayoutStructureWrapper>

                            </MaintenanceGuard>
                            <Toaster position="bottom-right" />
                        </GlobalLoadingProvider>
                    </FontProvider>
                </ThemeProvider>
                <Analytics />
            </body>
        </html >
    );
}
