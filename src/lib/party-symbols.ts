
export const PARTY_SYMBOL_MAP: Record<string, string> = {
    "Aam Janata Party": "/election/parties/symbols/Aam_Janata_Party.svg",
    "Bahujan Shakti Party": "/election/parties/symbols/Bahujan_Shakti_Party.svg",
    "CPN (Unified Marxist-Leninist)": "/election/parties/symbols/CPN-UML.svg",
    "CPN (UML)": "/election/parties/symbols/CPN-UML.svg",
    "CPN (Maoist Centre)": "/election/parties/symbols/Nepali-Communist-Party.svg", // Using general communist symbol if specific not found, or maybe re-use
    "Janamat Party": "/election/parties/symbols/Janamat_Party.svg",
    "Nepal Federal Socialist Party": "/election/parties/symbols/Nepal_Federal_Socialist_Party.png",
    "Nepal Janata Party": "/election/parties/symbols/Nepal_Janata_Party.svg",
    "Nepal Loktantrik Party": "/election/parties/symbols/Nepal_Loktantrik_Party.svg",
    "Nepal Workers Peasants Party": "/election/parties/symbols/Nepal_Majdoor_Kisan_Party.svg",
    "Nepal Sadbhawana Party": "/election/parties/symbols/Nepal_Sadbhawana_Party.svg",
    "Nepal Sushashan Party": "/election/parties/symbols/Nepal_Sushashan_Party.svg",
    "Nepali Congress": "/election/parties/symbols/Nepali-Congress.svg",
    "Janata Samajwadi Party, Nepal": "/election/parties/symbols/People's_Socialist_Party.svg",
    "Janata Samajwadi Party, Nepal (Set B)": "/election/parties/symbols/Peoples_Socialist_Party_Nepal.svg",
    "Pragatisheel Loktantrik Party": "/election/parties/symbols/Pragatisheel_Loktantrik_Party.svg",
    "Rastriya Janamorcha": "/election/parties/symbols/Rastriya_Janamorcha.png",
    "Rastriya Janamukti Party": "/election/parties/symbols/Rastriya_Janamukti_Party.png",
    "Rastriya Prajatantra Party": "/election/parties/symbols/Rastriya_Prajatantra_Party.svg",
    "Rastriya Swatantra Party": "/election/parties/symbols/Rastriya_Swatantra_Party.svg",
    "Sanghiya Loktantrik Rastriya Manch": "/election/parties/symbols/Sanghiya_Loktantrik_Rastriya_Manch.png",
};

export function getPartyLogo(partyName: string | undefined): string | null {
    if (!partyName) return null;

    // Direct match
    if (PARTY_SYMBOL_MAP[partyName]) {
        return PARTY_SYMBOL_MAP[partyName];
    }

    // Normalized match (case insensitive, trim)
    const normalized = partyName.trim();
    const key = Object.keys(PARTY_SYMBOL_MAP).find(k => k.toLowerCase() === normalized.toLowerCase());
    if (key) return PARTY_SYMBOL_MAP[key];

    return null;
}
