"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { LanguageToggle } from "@/components/language-toggle";

const links = [
    { href: "/", labelEn: "Home", labelNe: "गृहपृष्ठ" },
    { href: "/leaders", labelEn: "Leaders", labelNe: "स्तम्भहरू" },
    { href: "/history", labelEn: "History", labelNe: "इतिहास" },
    { href: "/articles", labelEn: "Articles", labelNe: "लेखहरू" },
    {
        href: "/coverage",
        labelEn: "Coverage",
        labelNe: "कभरेज",
    },
    { href: "/about", labelEn: "About Us", labelNe: "हाम्रा बारेमा" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const pathname = usePathname();
    const { language } = useLanguage();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            className={cn(
                "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-background/95 backdrop-blur-md border-border py-1 shadow-sm"
                    : "bg-background/80 backdrop-blur-sm border-transparent py-1"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 flex items-center justify-between h-14 md:h-16">
                {/* Logo - Left Aligned */}
                <Link href="/" className="flex items-center gap-3 group">
                    <span className="font-knight text-2xl text-center md:text-xl lg:text-xl text-primary tracking-wide leading-none pt-1 transition-transform duration-300 group-hover:scale-105">
                        THE <br /> LEADERS
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                    <nav className="flex items-center gap-2">
                        {links.map((link) => {
                            const label =
                                language === "ne"
                                    ? link.labelNe || link.labelEn
                                    : link.labelEn;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative px-5 py-2 text-sm font-medium uppercase transition-all duration-200 rounded",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <span className="block">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">

                    {/* Language toggle */}
                    <div className="hidden sm:flex items-center">
                        <LanguageToggle />
                    </div>
                    <div className="flex sm:hidden items-center">
                        <LanguageToggle className="scale-90 origin-center" />
                    </div>

                    <ThemeToggle />

                    <div className="hidden md:block">
                        <Link href="/subscribe">
                            <Button variant="default" size="default">
                                Subscribe
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" suppressHydrationWarning>
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85vw] sm:w-[350px] border-l border-border bg-background p-6">
                                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                                <div className="flex flex-col h-full mt-6">
                                    <div className="font-knight text-4xl text-primary tracking-wide mb-8">
                                        THE <br /> LEADERS
                                    </div>
                                    <nav className="flex flex-col gap-2">
                                        {links.map((link) => {
                                            const label = language === "ne" ? (link.labelNe || link.labelEn) : link.labelEn;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setIsSheetOpen(false)}
                                                    className={cn(
                                                        "text-lg font-medium uppercase transition-all duration-200 py-3 px-4 rounded-md",
                                                        pathname === link.href
                                                            ? "bg-primary/10 text-primary font-bold translate-x-2"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-accent hover:translate-x-1"
                                                    )}
                                                >
                                                    {label}
                                                </Link>
                                            );
                                        })}
                                    </nav>

                                    <div className="mt-auto mb-8 space-y-4">
                                        <Link href="/subscribe" onClick={() => setIsSheetOpen(false)}>
                                            <Button size="lg" className="w-full font-bebas tracking-wide text-xl">
                                                Subscribe
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
