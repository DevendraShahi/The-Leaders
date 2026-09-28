import { create } from 'zustand';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';

export type AudioTrack = {
    id: string;
    title: string;
    author: string;
    artwork: string;
    url: string;
};

interface AudioState {
    currentTrack: AudioTrack | null;
    isPlaying: boolean;
    isVisible: boolean;
    play: (track: AudioTrack) => Promise<void>;
    pause: () => void;
    resume: () => void;
    close: () => void;
}

let globalPlayer: AudioPlayer | null = null;

export const useAudioStore = create<AudioState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    isVisible: false,
    play: async (track) => {
        if (globalPlayer) {
            globalPlayer.release();
            globalPlayer = null;
        }
        
        globalPlayer = createAudioPlayer(track.url);
        globalPlayer.play();
        
        set({ currentTrack: track, isPlaying: true, isVisible: true });
    },
    pause: () => {
        if (globalPlayer) {
            globalPlayer.pause();
        }
        set({ isPlaying: false });
    },
    resume: () => {
        if (globalPlayer) {
            globalPlayer.play();
        }
        set({ isPlaying: true });
    },
    close: () => {
        if (globalPlayer) {
            globalPlayer.release();
            globalPlayer = null;
        }
        set({ isVisible: false, isPlaying: false, currentTrack: null });
    },
}));
