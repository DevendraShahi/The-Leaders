import { create } from "zustand";

interface ElectionMapState {
    selectedDistrict: string | null;
    hoveredDistrict: string | null;
    viewMode: "winner" | "turnout" | "margin";
    setSelectedDistrict: (id: string | null) => void;
    setHoveredDistrict: (id: string | null) => void;
    setViewMode: (mode: "winner" | "turnout" | "margin") => void;
}

export const useElectionMapStore = create<ElectionMapState>((set) => ({
    selectedDistrict: null,
    hoveredDistrict: null,
    viewMode: "winner",
    setSelectedDistrict: (id) => set({ selectedDistrict: id }),
    setHoveredDistrict: (id) => set({ hoveredDistrict: id }),
    setViewMode: (mode) => set({ viewMode: mode }),
}));
