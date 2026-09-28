"use client";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
                            className="group flex items-center gap-3 px-6 py-1 transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            <Badge
                                variant={item.type === "leader" ? "default" : "secondary"}
                                className={cn(
                                    "font-mono text-[10px] uppercase tracking-[0.14em]",
                                    item.type === "leader" ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" : "hover:bg-muted/80"
                                )}
                            >
                                {language === "ne"
                                    ? item.type === "leader"
                                        ? "स्तम्भ"
                                        : "लेख"
                                    : item.type === "leader"
                                        ? "Leader"
                                        : "Article"}
                            </Badge>
                            <span className="text-sm font-medium leading-tight select-none text-foreground transition-colors group-hover:text-primary">
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
