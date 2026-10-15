import { create } from "zustand";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { Platform } from "react-native";
export type AudioTrack = { id: string; title: string; author: string; artwork: string; url: string };
export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";
interface AudioState {
    currentTrack: AudioTrack | null; isPlaying: boolean; isVisible: boolean; status: PlaybackState;
    error: string | null; volume: number; play: (track: AudioTrack) => Promise<void>;
    pause: () => void; resume: () => void; close: () => void; setVolume: (volume: number) => void;
}
let player: AudioPlayer | null = null;
let subscription: { remove: () => void } | null = null;
let timeout: ReturnType<typeof setTimeout> | null = null;
let generation = 0;
let wantsPlayback = false;
function clearTimeoutIfNeeded() { if (timeout) clearTimeout(timeout); timeout = null; }
function dispose() {
    clearTimeoutIfNeeded();
    const previous = player;
    const listener = subscription;
    player = null;
    subscription = null;
    // Each cleanup step must run even if a platform-specific operation fails.
    try { listener?.remove(); } catch { /* Already removed */ }
    try { previous?.pause(); } catch { /* Already stopped */ }
    try { previous?.setActiveForLockScreen(false); } catch { /* Unsupported or already disposed */ }
    try { previous?.remove(); } catch { /* Already disposed */ }
}
export const useAudioStore = create<AudioState>((set, get) => ({
    currentTrack: null, isPlaying: false, isVisible: false, status: "idle", error: null, volume: 0.8,
    play: async (track) => {
        const request = ++generation;
        wantsPlayback = true; dispose();
        set({ currentTrack: track, isVisible: true, isPlaying: false, status: "loading", error: null });
        try {
            if (Platform.OS !== "web") await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" });
            if (request !== generation) return;
            player = createAudioPlayer(track.url);
            player.volume = get().volume;
            const watchConnection = () => {
                if (timeout) return;
                timeout = setTimeout(() => {
                    timeout = null;
                    if (request !== generation || get().isPlaying || !wantsPlayback) return;
                    wantsPlayback = false; player?.pause();
                    set({ status: "error", isPlaying: false, error: "The station is taking too long to connect. Try another station." });
                }, 20000);
            };
            subscription = player.addListener("playbackStatusUpdate", (event: AudioStatus) => {
                if (request !== generation || get().status === "error") return;
                if (event.playbackState.toLowerCase().includes("error")) {
                    wantsPlayback = false; clearTimeoutIfNeeded();
                    set({ status: "error", isPlaying: false, error: "This station could not be reached. Try again or choose another station." });
                    return;
                }
                const status: PlaybackState = !wantsPlayback ? "paused" : event.isBuffering || !event.isLoaded ? "loading" : event.playing ? "playing" : "paused";
                if (status === "playing") clearTimeoutIfNeeded();
                if (status === "loading") watchConnection();
                set({ status, isPlaying: status === "playing" });
            });
            if (Platform.OS !== "web") player.setActiveForLockScreen(true, { title: track.title, artist: track.author, artworkUrl: track.artwork }, { showSeekBackward: false, showSeekForward: false });
            watchConnection();
            player.play();
        } catch {
            if (request !== generation) return;
            wantsPlayback = false; dispose();
            set({ status: "error", isPlaying: false, error: "Unable to start the station. Check your connection and try again." });
        }
    },
    pause: () => { wantsPlayback = false; clearTimeoutIfNeeded(); player?.pause(); set({ status: "paused", isPlaying: false }); },
    resume: () => { const track = get().currentTrack; if (track) void get().play(track); },
    close: () => { generation++; wantsPlayback = false; dispose(); set({ currentTrack: null, isVisible: false, isPlaying: false, status: "idle", error: null }); },
    setVolume: (value) => { const volume = Math.max(0, Math.min(1, value)); if (player) player.volume = volume; set({ volume }); },
}));
