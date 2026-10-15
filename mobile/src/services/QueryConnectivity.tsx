import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import { onlineManager, focusManager } from "@tanstack/react-query";
import { getNetworkStateAsync, addNetworkStateListener, type NetworkState } from "expo-network";
export function QueryConnectivity() {
    useEffect(() => {
        if (Platform.OS === "web") return;
        onlineManager.setEventListener(setOnline => {
            const update = (state: NetworkState) => setOnline(state.isConnected !== false && state.isInternetReachable !== false);
            void getNetworkStateAsync().then(update).catch(() => undefined);
            const subscription = addNetworkStateListener(update);
            return () => subscription.remove();
        });
        const subscription = AppState.addEventListener("change", state => focusManager.setFocused(state === "active"));
        return () => { subscription.remove(); onlineManager.setEventListener(() => undefined); };
    }, []);
    return null;
}
