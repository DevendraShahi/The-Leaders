"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
    { href: "/admin/analytics", label: "Overview" },
    { href: "/admin/analytics/content", label: "Content" },
    { href: "/admin/analytics/audience", label: "Audience" },
];

export default function AnalyticsTabs() {
    const pathname = usePathname();

    return (
        <div className="overflow-x-auto border-b border-border">
            <div className="inline-flex min-w-max">
                {tabs.map((tab) => {
                    const active = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "px-5 py-2 text-xs uppercase tracking-widest font-mono border-b-2 whitespace-nowrap",
                                active
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
