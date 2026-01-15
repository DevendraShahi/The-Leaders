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
                            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
                                L
                            </div>
                            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                                The Leaders
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Honoring the legacy of those who shaped our nation. A premium archive of history, biography, and leadership.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif font-bold text-lg mb-6 text-foreground">Explore</h4>
                        <ul className="space-y-3">
                            {["Leaders", "History", "Parties", "Timeline"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        {item}
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
                                        href="#"
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
