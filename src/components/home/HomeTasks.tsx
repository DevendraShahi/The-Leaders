"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

const tasks = [
    { href: "/leaders", en: "Leaders", ne: "नेताहरू" },
    { href: "/history", en: "History", ne: "इतिहास" },
    { href: "/articles", en: "Articles", ne: "लेखहरू" },
    { href: "/coverage", en: "Coverage", ne: "कभरेज" },
];

export function HomeTasks() {
    const { language } = useLanguage();
    const isNepali = language === "ne";

    return (
        <section className="border-b border-border bg-background">
            <div className="container mx-auto max-w-5xl px-6 py-8 md:px-12 md:py-10">
                <p className="max-w-2xl text-base leading-relaxed text-foreground md:text-lg">
                    {isNepali
                        ? "द लिडर्स नेपालका नेता, इतिहास र समाचारको अभिलेख हो।"
                        : "The Leaders is Nepal’s archive of leaders, history, and the news."}
                </p>
                <nav
                    className="mt-5 flex flex-wrap gap-3"
                    aria-label={isNepali ? "यहाँबाट सुरु गर्नुहोस्" : "Start here"}
                >
                    {tasks.map((task) => (
                        <Link
                            key={task.href}
                            href={task.href}
                            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                            {isNepali ? task.ne : task.en}
                        </Link>
                    ))}
                </nav>
            </div>
        </section>
    );
}
