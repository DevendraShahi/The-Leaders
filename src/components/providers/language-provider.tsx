"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "ne";

type LanguageContextValue = {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "theleaders-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>("en");

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
            if (stored === "en" || stored === "ne") {
                setLanguageState(stored);
            }
        } catch {
            // ignore storage errors
        }
    }, []);

    const setLanguage = (lang: LanguageCode) => {
        setLanguageState(lang);
        try {
            window.localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            // ignore storage errors
        }
    };

    useEffect(() => {
        if (typeof document === "undefined") return;
        document.documentElement.lang = language;
        document.body.classList.remove("lang-en", "lang-ne");
        document.body.classList.add(language === "ne" ? "lang-ne" : "lang-en");
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return ctx;
}
