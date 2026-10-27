export type LocalizedText = string | { en?: string; ne?: string };

export type LiveNewsSource =
    | "OnlineKhabar"
    | "OnlineKhabar English"
    | "Setopati"
    | "Ratopati"
    | "Himal Khabar"
    | "CIJ Nepal"
    | "The Leaders Archive"
    | string;

export interface FeedSourceConfig {
    id: string;
    name: string;
    nepaliName: string;
    url: string;
    language: "ne" | "en";
    defaultCategoryEn: string;
    defaultCategoryNe: string;
}

export const ACTIVE_NEWS_SOURCES: FeedSourceConfig[] = [
    {
        id: "onlinekhabar-ne",
        name: "OnlineKhabar",
        nepaliName: "अनलाइनखबर",
        url: "https://www.onlinekhabar.com/feed",
        language: "ne",
        defaultCategoryEn: "NATIONAL",
        defaultCategoryNe: "राष्ट्रिय"
    },
    {
        id: "setopati",
        name: "Setopati",
        nepaliName: "सेतोपाटी",
        url: "https://www.setopati.com/feed",
        language: "ne",
        defaultCategoryEn: "DISPATCH",
        defaultCategoryNe: "विशेष"
    },
    {
        id: "ratopati",
        name: "Ratopati",
        nepaliName: "रातोपाटी",
        url: "https://www.ratopati.com/feed",
        language: "ne",
        defaultCategoryEn: "POLITICS",
        defaultCategoryNe: "राजनीति"
    },
    {
        id: "himalkhabar",
        name: "Himal Khabar",
        nepaliName: "हिमाल खबर",
        url: "https://himalkhabar.com/feed",
        language: "ne",
        defaultCategoryEn: "DISCOURSE",
        defaultCategoryNe: "विमर्श"
    },
    {
        id: "onlinekhabar-en",
        name: "OnlineKhabar English",
        nepaliName: "अनलाइनखबर अंग्रेजी",
        url: "https://english.onlinekhabar.com/feed",
        language: "en",
        defaultCategoryEn: "NATIONAL",
        defaultCategoryNe: "राष्ट्रिय"
    }
];

export const SOURCE_DISPLAY_MAP: Record<string, { en: string; ne: string }> = {
    "OnlineKhabar": { en: "OnlineKhabar", ne: "अनलाइनखबर" },
    "OnlineKhabar Nepali": { en: "OnlineKhabar", ne: "अनलाइनखबर" },
    "OnlineKhabar English": { en: "OnlineKhabar English", ne: "अनलाइनखबर अंग्रेजी" },
    "Setopati": { en: "Setopati", ne: "सेतोपाटी" },
    "Ratopati": { en: "Ratopati", ne: "रातोपाटी" },
    "Himal Khabar": { en: "Himal Khabar", ne: "हिमाल खबर" },
    "CIJ Nepal": { en: "CIJ Nepal", ne: "खोजी पत्रकारिता केन्द्र" },
    "The Leaders Archive": { en: "The Leaders Archive", ne: "द लिडर्स अभिलेख" }
};

export interface LiveDispatchItem {
    title: LocalizedText;
    slug: string;
    link?: string;
    date: string;
    summary: LocalizedText;
    content?: LocalizedText;
    tags: string[];
    isPublished: boolean;
    status: "published" | "draft" | "archived";
    image?: string;
    source: LiveNewsSource;
    isLiveFeed: boolean;
    language?: "ne" | "en" | "bilingual";
}
