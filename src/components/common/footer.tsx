import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin, Globe } from "lucide-react";

export function Footer({ socialLinks = [] }: { socialLinks?: any[] }) {
    // Map of icon names to components
    const IconMap: Record<string, any> = {
        facebook: Facebook,
        twitter: Twitter,
        instagram: Instagram,
        linkedin: Linkedin,
        youtube: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
    };

    return (
        <footer className="bg-background border-t border-border mt-auto">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <span className="font-knight text-center text-5xl md:text-7xl text-primary tracking-wide leading-none transition-transform duration-300 group-hover:scale-105">
                                THE <br /> LEADERS
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
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
                                { name: "Parties", href: "/election-2026/parties" },
                                { name: "Timeline", href: "/history" }
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
                            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility", "Contact Us"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href={
                                            item === "Terms of Service" ? "/terms" :
                                                item === "Contact Us" ? "/contact" :
                                                    item === "Accessibility" ? "/accessibility" :
                                                        item === "Privacy Policy" ? "/privacy-policy" :
                                                            item === "Cookie Policy" ? "/cookie-policy" :
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
                            {socialLinks && socialLinks.length > 0 ? (
                                socialLinks.map((link, i) => {
                                    const Icon = IconMap[link.platform] || Globe;
                                    return (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No social links configured.</p>
                            )}
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
