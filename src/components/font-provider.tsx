"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type FontOption = "bebas" | "anton" | "cinzel" | "oswald" | "six-caps" | "fjalla";

type FontContextType = {
    currentFont: FontOption;
    setFont: (font: FontOption) => void;
};

const FontContext = createContext<FontContextType | undefined>(undefined);

const FONTS: FontOption[] = ["bebas", "anton", "cinzel", "oswald", "six-caps", "fjalla"];

export function FontProvider({ children }: { children: React.ReactNode }) {
    const [currentFont, setCurrentFont] = useState<FontOption>("bebas");

    useEffect(() => {
        // Check local storage on mount
        const saved = localStorage.getItem("current-font") as FontOption;
        if (saved && FONTS.includes(saved)) {
            setCurrentFont(saved);
        }
    }, []);

    useEffect(() => {
        // Apply font class to body
        document.body.classList.remove(...FONTS.map(f => `font-${f}`));
        if (currentFont !== "bebas") { // 'bebas' is default, no class needed
            document.body.classList.add(`font-${currentFont}`);
        }
    }, [currentFont]);

    const setFont = (font: FontOption) => {
        if (FONTS.includes(font)) {
            setCurrentFont(font);
            localStorage.setItem("current-font", font);
        }
    };

    return (
        <FontContext.Provider value={{ currentFont, setFont }}>
            {children}
        </FontContext.Provider>
    );
}

export function useFont() {
    const context = useContext(FontContext);
    if (context === undefined) {
        throw new Error("useFont must be used within a FontProvider");
    }
    return context;
}
