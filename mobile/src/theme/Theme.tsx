import { createContext, useContext, useMemo, useEffect, type ReactNode } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";
import { useColorScheme } from "nativewind";
import { colorsFor, type AppColors } from "@/theme/tokens";
import { useAppStore } from "@/state/useAppStore";

const ThemeContext = createContext<AppColors>(colorsFor("dark"));

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useNativeColorScheme() === "light" ? "light" : "dark";
    const userTheme = useAppStore((state) => state.theme);
    const { setColorScheme } = useColorScheme();
    
    const activeScheme = userTheme === "system" ? systemScheme : userTheme;
    const colors = useMemo(() => colorsFor(activeScheme), [activeScheme]);
    
    useEffect(() => {
        setColorScheme(activeScheme);
    }, [activeScheme, setColorScheme]);
    
    return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export function useColors() {
    return useContext(ThemeContext);
}
