import type { Metadata } from "next";
import { Manrope, Bebas_Neue, Anton, Cinzel, Oswald, Six_Caps, Fjalla_One } from "next/font/google";
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

export const metadata: Metadata = {
  title: "The Leaders",
  description: "A premium archive of Nepal's leaders",
};

import { FontProvider } from "@/components/font-provider";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${bebas.variable} ${anton.variable} ${cinzel.variable} ${oswald.variable} ${sixCaps.variable} ${fjalla.variable} antialiased bg-background text-foreground`}
      >
        <FontProvider>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </FontProvider>
      </body>
    </html>
  );
}
