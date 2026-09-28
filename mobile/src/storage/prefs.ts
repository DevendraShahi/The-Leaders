import Storage from "expo-sqlite/kv-store";

export type LanguageCode = "en" | "ne";
export type ReaderScale = "sm" | "md" | "lg" | "xl";
export type ReaderLeading = "compact" | "regular" | "loose";

const LANGUAGE_KEY = "language";
const SCALE_KEY = "reader-scale";
const LEADING_KEY = "reader-leading";
const MELODY_KEY = "reader-melody";
const RECENT_KEY = "recent-searches";

function read(key: string) {
    try {
        return Storage.getItemSync(key) ?? undefined;
    } catch {
        return undefined;
    }
}

function write(key: string, value: string) {
    Storage.setItemSync(key, value);
}

export function readLanguage(): LanguageCode {
    return read(LANGUAGE_KEY) === "ne" ? "ne" : "en";
}

export function writeLanguage(language: LanguageCode) {
    write(LANGUAGE_KEY, language);
}

export function readReaderScale(): ReaderScale {
    const value = read(SCALE_KEY);
    if (value === "sm" || value === "lg" || value === "xl") return value;
    return "md";
}

export function writeReaderScale(scale: ReaderScale) {
    write(SCALE_KEY, scale);
}

export function readReaderLeading(): ReaderLeading {
    const value = read(LEADING_KEY);
    if (value === "compact" || value === "loose") return value;
    return "regular";
}

export function writeReaderLeading(leading: ReaderLeading) {
    write(LEADING_KEY, leading);
}

export function readMelody(): "off" | "1" | "2" | "3" | "4" {
    const value = read(MELODY_KEY);
    if (value === "1" || value === "2" || value === "3" || value === "4") return value;
    return "off";
}

export function writeMelody(melody: "off" | "1" | "2" | "3" | "4") {
    write(MELODY_KEY, melody);
}

export function readRecentSearches(): string[] {
    try {
        const parsed = JSON.parse(read(RECENT_KEY) || "[]");
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item): item is string => typeof item === "string").slice(0, 8);
    } catch {
        return [];
    }
}

export function rememberSearch(query: string) {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const next = [trimmed, ...readRecentSearches().filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    write(RECENT_KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
    write(RECENT_KEY, "[]");
}
