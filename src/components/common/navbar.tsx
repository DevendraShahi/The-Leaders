"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontToggle } from "@/components/font-toggle";
import { SubscribeDialog } from "./subscribe-dialog";

const links = [
    { href: "/", label: "Home" },
    { href: "/leaders", label: "Leaders" },
    { href: "/history", label: "History" },
    { href: "/election-2026", label: "Election 2026" },
    { href: "/articles", label: "Articles" },
    { href: "/about", label: "About Us" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const pathname = usePathname();

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
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-5 py-2 text-sm font-medium uppercase transition-all duration-200 rounded",
                                    pathname === link.href
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <span className="block">{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                        <AnimatePresence>
                            {isSearchOpen ? (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 240, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <Input
                                        placeholder="Search..."
                                        className="h-10 bg-background border-border focus-visible:ring-ring"
                                        autoFocus
                                        onBlur={() => setIsSearchOpen(false)}
                                    />
                                </motion.div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSearchOpen(true)}
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                            )}
                        </AnimatePresence>
                    </div>

                    <ThemeToggle />
                    <div className="hidden sm:block">
                        <FontToggle />
                    </div>

                    <div className="hidden md:block">
                        <SubscribeDialog>
                            <Button variant="default" size="default">
                                Subscribe
                            </Button>
                        </SubscribeDialog>
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
                                        {links.map((link) => (
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
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="mt-auto mb-8 space-y-4">
                                        <SubscribeDialog>
                                            <Button size="lg" className="w-full font-bebas tracking-wide text-xl">
                                                Subscribe
                                            </Button>
                                        </SubscribeDialog>
                                        <div className="flex justify-center gap-4">
                                            {/* Mobile specific toggles or social links could go here if needed */}
                                        </div>
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
