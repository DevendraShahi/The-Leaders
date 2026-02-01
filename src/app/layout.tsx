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

export const metadata: Metadata = {
  title: "The Leaders",
  description: "A premium archive of Nepal's leaders",
};

import { ThemeProvider } from "@/components/theme-provider";
import { FontProvider } from "@/components/font-provider";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

// ... existing imports

import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import MaintenancePage from "@/components/common/MaintenancePage";

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Fetch settings
  const settings = await getSettings();
  const isMaintenanceMode = settings?.maintenanceMode || false;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/auth");

  // Bypass maintenance for admin routes or if disabled
  const showContent = !isMaintenanceMode || isAdminRoute;

  if (!showContent) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${manrope.variable} ${bebas.variable} ${anton.variable} ${cinzel.variable} ${oswald.variable} ${sixCaps.variable} ${fjalla.variable} ${knight.variable} antialiased bg-background text-foreground`}>
          <MaintenancePage />
        </body>
      </html>
    );
  }

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
            <Navbar />
            <main className="min-h-screen py-[2.5rem] md:py-18">
              {children}
            </main>
            <Footer />
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
