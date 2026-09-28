import { useAppStore, type LanguageCode } from "@/state/useAppStore";
import { type ReactNode } from "react";

export function LanguageProvider({ children }: { children: ReactNode }) {
    // We no longer need a real provider since Zustand handles this globally,
    // but we keep the wrapper component so we don't break existing layouts.
    return <>{children}</>;
}

export function useLanguage() {
    const language = useAppStore((state) => state.language);
    const setLanguage = useAppStore((state) => state.setLanguage);

    return {
        language,
        setLanguage,
        toggleLanguage: () => setLanguage(language === "en" ? "ne" : "en"),
    };
}

export function pick(value: { en: string; ne: string } | undefined, language: LanguageCode) {
    if (!value) return "";
    return language === "ne" ? value.ne || value.en : value.en || value.ne;
}
