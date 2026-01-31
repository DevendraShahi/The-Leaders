"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontToggle } from "@/components/font-toggle";

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
                "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-transparent",
                isScrolled
                    ? "bg-background/95 backdrop-blur-md border-primary/20 py-2 shadow-xl shadow-foreground/5"
                    : "bg-transparent py-4"
            )}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 md:w-10 md:h-10 overflow-hidden rounded-sm transition-transform group-hover:scale-105">
                        <Image
                            src="/logo.svg"
                            alt="The Leaders"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                    <nav className="flex items-center gap-2">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-5 py-2 text-lg font-bebas tracking-widest uppercase transition-all duration-300 group border border-transparent hover:border-primary/30",
                                    pathname === link.href
                                        ? "bg-primary text-black shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
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
                                        placeholder="SEARCH LEADERS..."
                                        className="h-10 bg-black/50 border-primary/50 text-white placeholder:text-zinc-500 font-bebas tracking-widest focus-visible:ring-primary uppercase"
                                        autoFocus
                                        onBlur={() => setIsSearchOpen(false)}
                                    />
                                </motion.div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="hover:text-primary hover:bg-primary/10"
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
                        <Button variant="default" className="font-bebas text-xl tracking-wider bg-primary text-black hover:bg-accent rounded-none">
                            <span>Subscribe</span>
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] border-l-primary/20 bg-black">
                                <div className="flex flex-col gap-8 mt-8">
                                    <div className="font-bebas text-4xl text-primary uppercase">
                                        The Leaders
                                    </div>
                                    <nav className="flex flex-col gap-4 px-4">
                                        {links.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={cn(
                                                    "text-2xl font-bebas uppercase tracking-wide transition-colors pb-2 border-b",
                                                    pathname === link.href
                                                        ? "text-primary border-primary pl-2"
                                                        : "text-white/80 border-white/10 hover:text-white hover:pl-2"
                                                )}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>
                                    <Button className="w-full font-bebas text-xl bg-primary text-black hover:bg-accent">SUBSCRIBE</Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
