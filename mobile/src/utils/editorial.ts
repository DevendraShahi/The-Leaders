import { editorial, type AppLanguage } from "@/theme/tokens";

export function isRecentBreaking(iso: string, now = Date.now()) {
    const age = now - new Date(iso).getTime();
    return Number.isFinite(age) && age >= 0 && age <= editorial.breakingMaxAgeHours * 3_600_000;
}
export function storyDate(iso: string, language: AppLanguage, now = Date.now()) {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return "";
    const minutes = Math.max(0, Math.floor((now - date.getTime()) / 60_000));
    if (minutes < 1) return language === "ne" ? "अहिले" : "Just now";
    if (minutes < 60) return language === "ne" ? `${minutes} मिनेट अघि` : `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === "ne" ? `${hours} घण्टा अघि` : `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < editorial.relativeDateMaxDays) return language === "ne" ? `${days} दिन अघि` : `${days}d ago`;
    return new Intl.DateTimeFormat(language === "ne" ? "ne-NP" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kathmandu" }).format(date);
}

export function estimateReadingMinutes(content: string) {
    const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return words ? Math.ceil(words / 200) : 0;
}
export function readingLabel(minutes: number | undefined, language: AppLanguage) {
    return minutes && minutes > 0 ? language === "ne" ? `${minutes} मिनेट पढाइ` : `${minutes} min read` : "";
}
