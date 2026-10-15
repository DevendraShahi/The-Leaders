import { useSyncExternalStore } from "react";
import { Platform, View } from "react-native";
import { useNetworkState } from "expo-network";
import { WifiOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./primitives/AppText";
import { useColors } from "@/theme/Theme";
import { useLanguage } from "@/i18n/language";
import { spacing, layout } from "@/theme/tokens";
function subscribe(callback: () => void) {
    if (Platform.OS !== "web" || typeof window === "undefined") return () => {};
    window.addEventListener("online", callback); window.addEventListener("offline", callback);
    return () => { window.removeEventListener("online", callback); window.removeEventListener("offline", callback); };
}
function browserOnline() { return typeof navigator === "undefined" || navigator.onLine !== false; }
export function NetworkToast() {
    const network = useNetworkState();
    const online = useSyncExternalStore(subscribe, browserOnline, () => true);
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const { language } = useLanguage();
    const offline = Platform.OS === "web" ? !online : network.isConnected === false || network.isInternetReachable === false;
    if (!offline) return null;
    return <View accessibilityRole="alert" style={{ position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.primary, paddingTop: insets.top + spacing.md, paddingBottom: spacing.md, paddingHorizontal: spacing.gutter, flexDirection: "row", alignItems: "center", gap: spacing.sm }}><WifiOff color={colors.onPrimary} size={layout.iconSmall} /><AppText variant="meta" colorToken="onPrimary" style={{ flex: 1 }}>{language === "ne" ? "अफलाइन हुनुहुन्छ। सुरक्षित समाचार पढ्न सक्नुहुन्छ।" : "You're offline. Saved stories are available."}</AppText></View>;
}
