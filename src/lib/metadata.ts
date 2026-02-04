import { Metadata } from 'next';

interface MetadataParams {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogType?: 'website' | 'article' | 'profile';
    keywords?: string[];
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    noIndex?: boolean;
    icons?: any;
}

export function constructMetadata({
    title,
    description,
    canonical,
    ogImage = '/the-leader.png',
    ogType = 'website',
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    noIndex = false,
    icons,
}: MetadataParams): Metadata {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theleaders.com.np';
    const fullTitle = title === 'The Leaders' || title.includes('The Leaders |') ? title : `The Leaders | ${title}`;
    const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

    const defaultKeywords = [
        'Sher Bahadur Deuba',
        'Nepal politics',
        'Nepali Congress',
        'Nepal Prime Minister',
        'Nepal democracy',
        'Nepal elections',
        'Nepal government',
    ];

    const metadata: Metadata = {
        title: {
            default: fullTitle,
            template: `The Leaders | %s`,
        },
        description,
        keywords: [...defaultKeywords, ...keywords],
        authors: author ? [{ name: author }] : [{ name: 'The Leaders Team' }],
        creator: 'The Leaders',
        publisher: 'The Leaders',
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true, googleBot: { index: true, follow: true } },
        icons: icons || {
            icon: '/logo.svg',
            shortcut: '/logo.svg',
            apple: '/logo.svg',
        },
        openGraph: {
            title: fullTitle,
            description,
            url: canonicalUrl || siteUrl,
            siteName: 'The Leaders',
            locale: 'en_NP',
            type: ogType,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [imageUrl],
            creator: '@theleadersnepal',
        },
        alternates: {
            canonical: canonicalUrl,
        },
        metadataBase: new URL(siteUrl),
    };

    return metadata;
}
