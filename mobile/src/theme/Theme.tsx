import { createContext, useContext, useMemo, useEffect, type ReactNode } from "react";
import { View, useColorScheme as useNativeColorScheme } from "react-native";
import { useColorScheme, vars } from "nativewind";
import { colorsFor, layout, themeVariables, type AppColors } from "@/theme/tokens";
import { useAppStore } from "@/state/useAppStore";

const ThemeContext = createContext<AppColors>(colorsFor("dark"));

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useNativeColorScheme() === "dark" ? "dark" : "light";
    const userTheme = useAppStore((state) => state.theme);
    const { setColorScheme } = useColorScheme();
    
    const activeScheme = userTheme === "system" ? systemScheme : userTheme;
    const colors = useMemo(() => colorsFor(activeScheme), [activeScheme]);
    
    useEffect(() => {
        setColorScheme(activeScheme);
    }, [activeScheme, setColorScheme]);
    
    const variables = useMemo(() => vars(themeVariables(colors)), [colors]);
    return (
        <ThemeContext.Provider value={colors}>
            <View style={[variables, { flex: 1, backgroundColor: colors.background }]}>
                <View style={{ flex: 1, width: "100%", maxWidth: layout.contentMaxWidth, alignSelf: "center" }}>
                    {children}
                </View>
            </View>
        </ThemeContext.Provider>
    );
}

export function useColors() {
    return useContext(ThemeContext);
}
