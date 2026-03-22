import { Metadata } from 'next';

interface MetadataParams {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    ogImageWidth?: number;
    ogImageHeight?: number;
    ogImageType?: string;
    ogImageAlt?: string;
    ogType?: 'website' | 'article' | 'profile';
    keywords?: string[];
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;       // article section e.g. "Election 2026", "Politics"
    tags?: string[];        // article tags for og:article:tag
    noIndex?: boolean;
    noFollow?: boolean;
    icons?: any;
    locale?: string;        // override default en_NP
    themeColor?: string;
}

export function constructMetadata({
    title,
    description,
    canonical,
    ogImage = '/og/facebook-og.jpg',
    ogImageWidth = 1200,
    ogImageHeight = 630,
    ogImageType = 'image/jpeg',
    ogImageAlt,
    ogType = 'website',
    keywords = [],
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    noIndex = false,
    noFollow = false,
    icons,
    locale = 'en_NP',
    themeColor = '#111827',
}: MetadataParams): Metadata {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-leadersnp.com';
    const siteName = 'The Leaders Nepal';
    const brandHandle = '@theleadersnepal';

    // Title: avoid double-prefixing
    const fullTitle =
        title === 'The Leaders Nepal' ||
        title === 'The Leaders' ||
        title.startsWith('The Leaders | ') ||
        title.startsWith('The Leaders Nepal | ')
            ? title
            : `The Leaders Nepal | ${title}`;

    // Canonical URL
    const canonicalUrl = canonical
        ? canonical.startsWith('http://') || canonical.startsWith('https://')
            ? canonical
            : `${siteUrl}${canonical}`
        : undefined;

    // OG image — always absolute + secure
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
    const imageSecureUrl = imageUrl.startsWith('https://')
        ? imageUrl
        : imageUrl.replace(/^http:\/\//, 'https://');
    const imageAlt = ogImageAlt || title;

    // Default keyword set — broad brand + topic coverage
    const defaultKeywords = [
        'The Leaders Nepal',
        'LeadersNP',
        'the-leadersnp.com',
        'Nepal politics',
        'Nepal election 2026',
        'Nepal election 2082',
        'Nepal HoR election',
        'RSP Nepal',
        'Rastriya Swatantra Party',
        'Nepal parliament',
        'Nepali Congress',
        'CPN-UML',
        'Nepal Prime Minister',
        'Nepal government',
        'Nepal democracy',
        'Nepal political news',
        'Nepal leaders profiles',
        'Nepal election results',
        'Sher Bahadur Deuba',
        'KP Sharma Oli',
        'Rabi Lamichhane',
    ];

    // Robots directives
    const robotsValue = noIndex || noFollow
        ? {
              index: !noIndex,
              follow: !noFollow,
              googleBot: {
                  index: !noIndex,
                  follow: !noFollow,
              },
          }
        : {
              index: true,
              follow: true,
              googleBot: {
                  index: true,
                  follow: true,
                  'max-snippet': -1 as const,
                  'max-image-preview': 'large' as const,
                  'max-video-preview': -1 as const,
              },
          };

    const metadata: Metadata = {
        metadataBase: new URL(siteUrl),

        title: {
            default: fullTitle,
            template: `The Leaders Nepal | %s`,
        },
        description,
        keywords: [...defaultKeywords, ...keywords, ...tags],

        authors: author
            ? [{ name: author }]
            : [{ name: 'The Leaders Nepal Editorial Team', url: siteUrl }],
        creator: siteName,
        publisher: siteName,
        applicationName: 'The Leaders Nepal',
        category: section || 'News & Politics',

        robots: robotsValue,

        icons: icons || {
            icon: [
                { url: '/logo.svg', type: 'image/svg+xml' },
                { url: '/favicon.ico', sizes: '32x32' },
            ],
            shortcut: '/favicon.ico',
            apple: [{ url: '/logo.svg', type: 'image/svg+xml' }],
        },

        // Verification tags — set env vars to activate
        ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
            verification: {
                google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
                ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
                    other: {
                        'msvalidate.01': [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION],
                    },
                }),
            },
        }),

        openGraph: {
            title: fullTitle,
            description,
            url: canonicalUrl || siteUrl,
            siteName,
            locale,
            alternateLocale: locale === 'en_NP' ? ['ne_NP', 'en_US'] : ['en_NP', 'en_US'],
            type: ogType,
            images: [
                {
                    url: imageUrl,
                    secureUrl: imageSecureUrl,
                    type: ogImageType,
                    width: ogImageWidth,
                    height: ogImageHeight,
                    alt: imageAlt,
                },
            ],
            // Article-specific OG fields
            ...(ogType === 'article' && {
                ...(publishedTime && { publishedTime }),
                ...(modifiedTime && { modifiedTime }),
                ...(author && { authors: [author] }),
                ...(section && { section }),
                ...(tags.length > 0 && { tags }),
            }),
        },

        twitter: {
            card: 'summary_large_image',
            site: brandHandle,
            creator: brandHandle,
            title: fullTitle,
            description,
            images: [
                {
                    url: imageSecureUrl,
                    alt: imageAlt,
                    width: ogImageWidth,
                    height: ogImageHeight,
                },
            ],
        },

        // Canonical + language alternates
        alternates: {
            ...(canonicalUrl && { canonical: canonicalUrl }),
            languages: {
                'en-NP': canonicalUrl || siteUrl,
                'ne-NP': canonicalUrl
                    ? canonicalUrl.replace(siteUrl, `${siteUrl}/ne`)
                    : `${siteUrl}/ne`,
            },
        },

        // Apple web app / PWA hints
        appleWebApp: {
            capable: true,
            title: siteName,
            statusBarStyle: 'black-translucent',
        },

        formatDetection: {
            email: false,
            telephone: false,
            address: false,
        },
    };

    return metadata;
}
