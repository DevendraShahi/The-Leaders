import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-32 h-32">
                                <Image src="/logo.svg" alt="The Leaders" fill className="object-contain" />
                            </div>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Honoring the legacy of those who shaped our nation. A premium archive of history, biography, and leadership.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif font-bold text-lg mb-6 text-foreground">Explore</h4>
                        <ul className="space-y-3">
                            {[
                                { name: "Leaders", href: "/leaders" },
                                { name: "History", href: "/history" },
                                { name: "Election 2026", href: "/election-2026" },
                                { name: "Parties", href: "#" }, // Placeholder
                                { name: "Timeline", href: "#" }  // Placeholder
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-serif font-bold text-lg mb-6 text-foreground">Legal</h4>
                        <ul className="space-y-3">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={
                                            item === "Terms of Service" ? "/terms" :
                                                item === "Contact Us" ? "/contact" :
                                                    "#"
                                        }
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-serif font-bold text-lg mb-6 text-foreground">Stay Connected</h4>
                        <p className="text-muted-foreground text-sm mb-4">
                            Subscribe to get the latest biographies and historical insights.
                        </p>
                        <div className="flex gap-4 mt-6">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} The Leaders. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Designed with <span className="text-primary">♥</span> in Nepal
                    </p>
                </div>
            </div>
        </footer>
    );
}
