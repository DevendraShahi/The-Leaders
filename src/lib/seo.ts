export function getSiteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || "https://the-leadersnp.com";
}

export function absoluteUrl(path: string): string {
    const base = getSiteUrl().replace(/\/+$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}

export function articleJsonLd(input: {
    path: string;
    headline: string;
    description: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    authorName?: string;
    keywords?: string[];
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: input.headline,
        description: input.description,
        image: [input.image || absoluteUrl("/the-leader.png")],
        datePublished: input.datePublished,
        dateModified: input.dateModified || input.datePublished,
        mainEntityOfPage: absoluteUrl(input.path),
        author: {
            "@type": "Person",
            name: input.authorName || "The Leaders Team",
        },
        publisher: {
            "@type": "Organization",
            name: "The Leaders",
            logo: {
                "@type": "ImageObject",
                url: absoluteUrl("/logo.svg"),
            },
        },
        keywords: input.keywords?.join(", "),
    };
}

export function profileJsonLd(input: {
    path: string;
    name: string;
    description: string;
    image?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
            "@type": "Person",
            name: input.name,
            description: input.description,
            image: input.image || absoluteUrl("/the-leader.png"),
            url: absoluteUrl(input.path),
        },
    };
}
