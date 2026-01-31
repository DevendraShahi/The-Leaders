export const districtMap: Record<string, string> = {
    "Achham": "अछाम",
    "Arghakhanchi": "अर्घाखाँची",
    "Baglung": "बागलुङ",
    "Baitadi": "बैतडी",
    "Bajhang": "बझाङ",
    "Bajura": "बाजुरा",
    "Banke": "बाँके",
    "Bara": "बारा",
    "Bardiya": "बर्दिया",
    "Bhaktapur": "भक्तपुर",
    "Bhojpur": "भोजपुर",
    "Chitwan": "चितवन",
    "Dadeldhura": "डडेल्धुरा",
    "Dailekh": "दैलेख",
    "Dang": "दाङ",
    "Darchula": "दार्चुला",
    "Dhading": "धादिङ",
    "Dhankuta": "धनकुटा",
    "Dhanusha": "धनुषा",
    "Dolakha": "दोलखा",
    "Dolpa": "डोल्पा",
    "Doti": "डोटी",
    "Gorkha": "गोरखा",
    "Gulmi": "गुल्मी",
    "Humla": "हुम्ला",
    "Ilam": "इलाम",
    "Jajarkot": "जाजरकोट",
    "Jhapa": "झापा",
    "Jumla": "जुम्ला",
    "Kailali": "कैलाली",
    "Kalikot": "कालीकोट",
    "Kanchanpur": "कञ्चनपुर",
    "Kapilvastu": "कपिलवस्तु",
    "Kaski": "कास्की",
    "Kathmandu": "काठमाडौँ",
    "Kavrepalanchok": "काभ्रेपलाञ्चोक",
    "Khotang": "खोटाङ",
    "Lalitpur": "ललितपुर",
    "Lamjung": "लमजुङ",
    "Mahottari": "महोत्तरी",
    "Makwanpur": "मकवानपुर",
    "Manang": "मनाङ",
    "Morang": "मोरङ",
    "Mugu": "मुगु",
    "Mustang": "मुस्ताङ",
    "Myagdi": "म्याग्दी",
    "Nawalparasi": "नवलपरासी", // Note: Might need split handling if JSON has East/West
    "Nuwakot": "नुवाकोट",
    "Okhaldhunga": "ओखलढुङ्गा",
    "Palpa": "पाल्पा",
    "Panchthar": "पाँचथर",
    "Parbat": "पर्वत",
    "Parsa": "पर्सा",
    "Pyuthan": "प्युठान",
    "Ramechhap": "रामेछाप",
    "Rasuwa": "रसुवा",
    "Rautahat": "रौतहट",
    "Rolpa": "रोल्पा",
    "Rukum": "रुकुम", // Note: Might need split handling
    "Rupandehi": "रुपन्देही",
    "Salyan": "सल्यान",
    "Sankhuwasabha": "संखुवासभा",
    "Saptari": "सप्तरी",
    "Sarlahi": "सर्लाही",
    "Sindhuli": "सिन्धुली",
    "Sindhupalchok": "सिन्धुपाल्चोक",
    "Siraha": "सिराहा",
    "Solukhumbu": "सोलुखुम्बु",
    "Sunsari": "सुनसरी",
    "Surkhet": "सुर्खेत",
    "Syangja": "स्याङ्जा",
    "Tanahu": "तनहुँ",
    "Taplejung": "ताप्लेजुङ",
    "Terhathum": "तेह्रथुम",
    "Udayapur": "उदयपुर"
};

export function getNepaliDistrict(englishName: string | null): string | null {
    if (!englishName) return null;
    // Normalize input to Title Case just in case, though SVG IDs seem proper
    const normalized = englishName.charAt(0).toUpperCase() + englishName.slice(1).toLowerCase();

    // Direct lookup
    if (districtMap[englishName]) return districtMap[englishName];
    if (districtMap[normalized]) return districtMap[normalized];

    console.warn(`No Nepali mapping found for district: ${englishName}`);
    return englishName; // Fallback
}
