"use client";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export type MarqueeItem = {
    type: 'article' | 'leader';
    titleEn: string;
    titleNe: string;
    link: string;
};

export function HeroMarqueeClient({ items }: { items: MarqueeItem[] }) {
    const { language } = useLanguage();
    
    if (!items || items.length === 0) return null;

    return (
        <div className="marquee-shell">
            <div className="marquee-fade marquee-fade-left" aria-hidden />
            <div className="marquee-fade marquee-fade-right" aria-hidden />
            <Marquee 
                gradient={false} 
                speed={40} 
                pauseOnHover={true}
                className="overflow-hidden"
            >
                <div className="marquee-track" role="list">
                    {items.map((item, idx) => (
                        <Link
                            key={`${item.link}-${idx}`}
                            href={item.link}
                            role="listitem"
                            className="marquee-chip group rounded-none px-6"
                        >
                            <span
                                className={cn(
                                    "marquee-pill rounded-none",
                                    item.type === "leader"
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "bg-muted text-muted-foreground border border-border"
                                )}
                            >
                                {language === "ne"
                                    ? item.type === "leader"
                                        ? "स्तम्भ"
                                        : "लेख"
                                    : item.type === "leader"
                                        ? "Leader"
                                        : "Article"}
                            </span>
                            <span className="text-sm font-medium leading-tight select-none">
                                {language === "ne"
                                    ? item.titleNe || item.titleEn
                                    : item.titleEn}
                            </span>
                        </Link>
                    ))}
                </div>
            </Marquee>
        </div>
    );
}
