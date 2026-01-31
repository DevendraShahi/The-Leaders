import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { name: "Grand Central", href: "/election-2026" },
    { name: "Daily Brief", href: "/election-2026/daily-brief" },
    { name: "Fact Checks", href: "/election-2026/fact-checks" },
    { name: "PR Candidates", href: "/election-2026/pr-candidates" },
    { name: "Profiles", href: "/election-2026/profiles" },
];

export function ElectionNavbar() {
    const pathname = usePathname();

    return (
        <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
            <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="mr-4 hidden md:flex">
                    <Link href="/election-2026" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bebas text-xl font-bold sm:inline-block">
                            ELECTION 2026
                        </span>
                    </Link>
                    <nav className="flex items-center gap-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    pathname === item.href ? "text-primary" : "text-foreground/60"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
