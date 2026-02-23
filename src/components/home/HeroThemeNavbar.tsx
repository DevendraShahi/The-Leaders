"use client";

interface HeroThemeNavbarProps {
    items: string[];
}

export function HeroThemeNavbar({ items }: HeroThemeNavbarProps) {
    return (
        <nav className="border-b border-border/80">
            <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto px-4 py-3 sm:px-6">
                {items.map((item) => (
                    <button
                        key={item}
                        type="button"
                        className="whitespace-nowrap border border-transparent px-3 py-1.5 font-sans text-[12px] text-foreground/72 transition-colors hover:border-border hover:bg-card/60 hover:text-foreground"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </nav>
    );
}
