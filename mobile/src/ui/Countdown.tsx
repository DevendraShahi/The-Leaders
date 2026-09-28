import { useEffect, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/ui/AppText";
import { useColors } from "@/theme/Theme";
import { pick, useLanguage } from "@/i18n/language";
import { ui } from "@/i18n/copy";

export function Countdown({ iso, label }: { iso: string; label: string }) {
    const colors = useColors();
    const { language } = useLanguage();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const target = new Date(iso).getTime();
    const days = Math.max(0, Math.ceil((target - now) / 86_400_000));

    return (
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
            <AppText
                variant="body"
                style={{ color: colors.brandRed, fontFamily: "Manrope_600SemiBold", fontSize: 28, lineHeight: 32 }}
            >
                {String(days)}
            </AppText>
            <AppText variant="meta" style={{ color: colors.textSecondary, flex: 1 }}>
                {pick(ui.days, language)} · {label}
            </AppText>
        </View>
    );
}
