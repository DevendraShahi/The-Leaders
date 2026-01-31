import { create } from 'zustand';

interface ElectionState {
    selectedDistrict: string | null;
    hoveredDistrict: string | null;
    setSelectedDistrict: (district: string | null) => void;
    setHoveredDistrict: (district: string | null) => void;
    // We can expand this later for other global filters like "Party" or "Year"
}

export const useElectionStore = create<ElectionState>((set) => ({
    selectedDistrict: null,
    hoveredDistrict: null,
    setSelectedDistrict: (district) => set({ selectedDistrict: district }),
    setHoveredDistrict: (district) => set({ hoveredDistrict: district }),
}));
