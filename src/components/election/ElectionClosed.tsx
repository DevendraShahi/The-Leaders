"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

export function ElectionClosed() {
    const { language } = useLanguage();
    const pathname = usePathname();
    const isNepali = language === "ne";

    useEffect(() => {
        document.title = isNepali
            ? "निर्वाचन डेस्क बन्द छ | The Leaders"
            : "The election desk is closed | The Leaders";
    }, [isNepali, pathname]);

    return (
        <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 py-24">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                The Leaders
            </p>
            <h1 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
                {isNepali ? "निर्वाचन डेस्क बन्द छ।" : "The election desk is closed."}
            </h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">
                {isNepali
                    ? "२०२६ को निर्वाचन कभरेज अब अद्यावधिक हुँदैन। हालका रिपोर्ट लेख र कभरेजमा छन्।"
                    : "Election 2026 coverage is no longer being updated. Current reporting is in Articles and Coverage."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                    <Link href="/articles">{isNepali ? "लेखहरू" : "Articles"}</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/coverage">{isNepali ? "कभरेज" : "Coverage"}</Link>
                </Button>
            </div>
        </section>
    );
}
