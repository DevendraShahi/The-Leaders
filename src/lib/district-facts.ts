// Comprehensive District Data for Nepal Election 2026
// This file contains factual context (historical strongholds, key figures) and realistic projections.

export interface DistrictFact {
    name: string;
    province: string;
    headquarters: string;
    constituencies: number;
    totalVotersEst: number;
    stronghold?: string; // e.g., "NC Fortress", "UML Stronghold", "RSP Emerging"
    keyFigure?: string; // e.g., "Sher Bahadur Deuba", "KP Sharma Oli"
    competitors: string[]; // Top 2-3 parties
}

export const DISTRICT_FACTS: Record<string, DistrictFact> = {
    // === Koshi Province ===
    "Taplejung": { name: "Taplejung", province: "Koshi", headquarters: "Phungling", constituencies: 1, totalVotersEst: 90000, stronghold: "UML Lean", keyFigure: "Yogesh Bhattarai", competitors: ["UML", "Maoist"] },
    "Panchthar": { name: "Panchthar", province: "Koshi", headquarters: "Phidim", constituencies: 1, totalVotersEst: 140000, stronghold: "Competitive", keyFigure: "Basanta Nembang", competitors: ["UML", "NC"] },
    "Ilam": { name: "Ilam", province: "Koshi", headquarters: "Ilam", constituencies: 2, totalVotersEst: 220000, stronghold: "UML Stronghold", keyFigure: "Subas Nembang (Legacy)", competitors: ["UML", "NC"] },
    "Jhapa": { name: "Jhapa", province: "Koshi", headquarters: "Bhadrapur", constituencies: 5, totalVotersEst: 650000, stronghold: "UML Fortress", keyFigure: "KP Sharma Oli", competitors: ["UML", "NC", "RPP"] },
    "Morang": { name: "Morang", province: "Koshi", headquarters: "Biratnagar", constituencies: 6, totalVotersEst: 720000, stronghold: "NC Stronghold", keyFigure: "Dr. Shekhar Koirala", competitors: ["NC", "UML", "Maoist"] },
    "Sunsari": { name: "Sunsari", province: "Koshi", headquarters: "Inaruwa", constituencies: 4, totalVotersEst: 540000, stronghold: "Competitive", keyFigure: "Gyanendra Bahadur Karki", competitors: ["NC", "UML", "RSP"] },
    "Dhankuta": { name: "Dhankuta", province: "Koshi", headquarters: "Dhankuta", constituencies: 1, totalVotersEst: 110000, stronghold: "UML Lean", keyFigure: "Rajendra Rai", competitors: ["UML", "NC"] },
    "Terhathum": { name: "Terhathum", province: "Koshi", headquarters: "Myanglung", constituencies: 1, totalVotersEst: 75000, stronghold: "", keyFigure: "", competitors: ["NC", "UML"] },
    "Sankhuwasabha": { name: "Sankhuwasabha", province: "Koshi", headquarters: "Khandbari", constituencies: 1, totalVotersEst: 120000, stronghold: "Competitive", keyFigure: "", competitors: ["NC", "UML"] },
    "Bhojpur": { name: "Bhojpur", province: "Koshi", headquarters: "Bhojpur", constituencies: 1, totalVotersEst: 130000, stronghold: "Maoist Lean", keyFigure: "", competitors: ["Maoist", "UML"] },
    "Solukhumbu": { name: "Solukhumbu", province: "Koshi", headquarters: "Salleri", constituencies: 1, totalVotersEst: 80000, stronghold: "Competitive", keyFigure: "", competitors: ["NC", "Maoist"] },
    "Okhaldhunga": { name: "Okhaldhunga", province: "Koshi", headquarters: "Siddhicharan", constituencies: 1, totalVotersEst: 115000, stronghold: "NC Lean", keyFigure: "Ram Hari Khatiwada", competitors: ["NC", "UML"] },
    "Khotang": { name: "Khotang", province: "Koshi", headquarters: "Diktel", constituencies: 1, totalVotersEst: 145000, stronghold: "Maoist Lean", keyFigure: "", competitors: ["Maoist", "UML"] },
    "Udayapur": { name: "Udayapur", province: "Koshi", headquarters: "Gaighat", constituencies: 2, totalVotersEst: 230000, stronghold: "Competitive", keyFigure: "Dr. Narayan Khadka", competitors: ["NC", "UML"] },

    // === Madhesh Province ===
    "Saptari": { name: "Saptari", province: "Madhesh", headquarters: "Rajbiraj", constituencies: 4, totalVotersEst: 420000, stronghold: "Madhesh Party Lean", keyFigure: "Upendra Yadav", competitors: ["JSP", "Janomat", "NC"] },
    "Siraha": { name: "Siraha", province: "Madhesh", headquarters: "Siraha", constituencies: 4, totalVotersEst: 410000, stronghold: "Competitive", keyFigure: "", competitors: ["UML", "JSP", "NC"] },
    "Dhanusa": { name: "Dhanusa", province: "Madhesh", headquarters: "Janakpur", constituencies: 4, totalVotersEst: 480000, stronghold: "Competitive", keyFigure: "", competitors: ["NC", "UML", "JSP"] },
    "Mahottari": { name: "Mahottari", province: "Madhesh", headquarters: "Jaleshwor", constituencies: 4, totalVotersEst: 400000, stronghold: "LSP/JSP Lean", keyFigure: "Mahanta Thakur", competitors: ["LSP", "JSP", "UML"] },
    "Sarlahi": { name: "Sarlahi", province: "Madhesh", headquarters: "Malangwa", constituencies: 4, totalVotersEst: 460000, stronghold: "Competitive", keyFigure: "", competitors: ["NC", "Maoist", "UML"] },
    "Bara": { name: "Bara", province: "Madhesh", headquarters: "Kalaiya", constituencies: 4, totalVotersEst: 430000, stronghold: "Competitive", keyFigure: "", competitors: ["UML", "JSP", "NC"] },
    "Parsa": { name: "Parsa", province: "Madhesh", headquarters: "Birgunj", constituencies: 4, totalVotersEst: 350000, stronghold: "JSP Stronghold", keyFigure: "Pradeep Yadav", competitors: ["JSP", "NC"] },
    "Rautahat": { name: "Rautahat", province: "Madhesh", headquarters: "Gaur", constituencies: 4, totalVotersEst: 410000, stronghold: "Unified Socialist Lean", keyFigure: "Madhav Kumar Nepal", competitors: ["US", "Maoist", "NC"] },

    // === Bagmati Province ===
    "Sindhuli": { name: "Sindhuli", province: "Bagmati", headquarters: "Sindhulimadi", constituencies: 2, totalVotersEst: 210000, stronghold: "Maoist Lean", keyFigure: "", competitors: ["Maoist", "UML"] },
    "Ramechhap": { name: "Ramechhap", province: "Bagmati", headquarters: "Manthali", constituencies: 1, totalVotersEst: 160000, stronghold: "Competitive", keyFigure: "", competitors: ["NC", "UML"] },
    "Dolakha": { name: "Dolakha", province: "Bagmati", headquarters: "Charikot", constituencies: 1, totalVotersEst: 155000, stronghold: "UML Lean", keyFigure: "", competitors: ["UML", "Maoist"] },
    "Bhaktapur": { name: "Bhaktapur", province: "Bagmati", headquarters: "Bhaktapur", constituencies: 2, totalVotersEst: 190000, stronghold: "NWPP/RSP Battleground", keyFigure: "Prem Suwal", competitors: ["NWPP", "RSP", "NC"] },
    "Dhading": { name: "Dhading", province: "Bagmati", headquarters: "Dhading Besi", constituencies: 2, totalVotersEst: 270000, stronghold: "Unified Socialist/NC", keyFigure: "Rajendra Pandey", competitors: ["US", "NC", "UML"] },
    "Kathmandu": { name: "Kathmandu", province: "Bagmati", headquarters: "Kathmandu", constituencies: 10, totalVotersEst: 640000, stronghold: "RSP Surge", keyFigure: "Gagan Thapa", competitors: ["RSP", "NC", "UML"] },
    "Kavrepalanchok": { name: "Kavrepalanchok", province: "Bagmati", headquarters: "Dhulikhel", constituencies: 2, totalVotersEst: 310000, stronghold: "UML Lean", keyFigure: "Gokul Baskota", competitors: ["UML", "NC"] },
    "Lalitpur": { name: "Lalitpur", province: "Bagmati", headquarters: "Lalitpur", constituencies: 3, totalVotersEst: 250000, stronghold: "RSP/NC Competitive", keyFigure: "Toshima Karki", competitors: ["RSP", "NC", "UML"] },
    "Nuwakot": { name: "Nuwakot", province: "Bagmati", headquarters: "Bidur", constituencies: 2, totalVotersEst: 240000, stronghold: "NC/Maoist Lean", keyFigure: "Arjun Narsingh KC", competitors: ["NC", "Maoist"] },
    "Rasuwa": { name: "Rasuwa", province: "Bagmati", headquarters: "Dhunche", constituencies: 1, totalVotersEst: 40000, stronghold: "NC Lean", keyFigure: "", competitors: ["NC", "UML"] },
    "Sindhupalchok": { name: "Sindhupalchok", province: "Bagmati", headquarters: "Chautara", constituencies: 2, totalVotersEst: 260000, stronghold: "Maoist/NC", keyFigure: "Agni Sapkota", competitors: ["Maoist", "UML"] },
    "Chitwan": { name: "Chitwan", province: "Bagmati", headquarters: "Bharatpur", constituencies: 3, totalVotersEst: 400000, stronghold: "RSP Headquarters", keyFigure: "Rabi Lamichhane", competitors: ["RSP", "Maoist", "NC"] },
    "Makwanpur": { name: "Makwanpur", province: "Bagmati", headquarters: "Hetauda", constituencies: 2, totalVotersEst: 300000, stronghold: "RPP/UML Lean", keyFigure: "Kamal Thapa (Influence)", competitors: ["RPP", "UML", "NC"] },

    // === Gandaki Province ===
    "Gorkha": { name: "Gorkha", province: "Gandaki", headquarters: "Gorkha", constituencies: 2, totalVotersEst: 220000, stronghold: "Maoist Stronghold", keyFigure: "Pushpa Kamal Dahal (Prachanda)", competitors: ["Maoist", "NC"] },
    "Lamjung": { name: "Lamjung", province: "Gandaki", headquarters: "Besishahar", constituencies: 1, totalVotersEst: 130000, stronghold: "UML Lean", keyFigure: "Prithvi Subba Gurung", competitors: ["UML", "NC"] },
    "Tanahu": { name: "Tanahu", province: "Gandaki", headquarters: "Damauli", constituencies: 2, totalVotersEst: 240000, stronghold: "RSP/NC Battleground", keyFigure: "Swarnim Wagle", competitors: ["RSP", "NC"] },
    "Syangja": { name: "Syangja", province: "Gandaki", headquarters: "Syangja", constituencies: 2, totalVotersEst: 250000, stronghold: "NC Stronghold", keyFigure: "Dhanraj Gurung", competitors: ["NC", "UML"] },
    "Kaski": { name: "Kaski", province: "Gandaki", headquarters: "Pokhara", constituencies: 3, totalVotersEst: 300000, stronghold: "RSP Rising", keyFigure: "Rabindra Adhikari (Legacy)", competitors: ["RSP", "UML", "NC"] },
    "Manang": { name: "Manang", province: "Gandaki", headquarters: "Chame", constituencies: 1, totalVotersEst: 7000, stronghold: "NC/Indep", keyFigure: "Tek Bahadur Gurung", competitors: ["NC", "UML"] },
    "Mustang": { name: "Mustang", province: "Gandaki", headquarters: "Jomsom", constituencies: 1, totalVotersEst: 11000, stronghold: "NC Lean", keyFigure: "", competitors: ["NC", "UML"] },
    "Myagdi": { name: "Myagdi", province: "Gandaki", headquarters: "Beni", constituencies: 1, totalVotersEst: 85000, stronghold: "UML Lean", keyFigure: "", competitors: ["UML", "NC"] },
    "Parbat": { name: "Parbat", province: "Gandaki", headquarters: "Kusma", constituencies: 1, totalVotersEst: 120000, stronghold: "UML Lean", keyFigure: "Padam Giri", competitors: ["UML", "NC"] },
    "Baglung": { name: "Baglung", province: "Gandaki", headquarters: "Baglung", constituencies: 2, totalVotersEst: 190000, stronghold: "Janamorcha/NC", keyFigure: "Chitra Bahadur KC", competitors: ["RJM", "NC", "UML"] },
    "Nawalpur": { name: "Nawalpur", province: "Gandaki", headquarters: "Kawasoti", constituencies: 2, totalVotersEst: 260000, stronghold: "NC Lean", keyFigure: "Shashank Koirala", competitors: ["NC", "UML"] },

    // === Lumbini Province ===
    "Gulmi": { name: "Gulmi", province: "Lumbini", headquarters: "Tamghas", constituencies: 2, totalVotersEst: 220000, stronghold: "UML/NC", keyFigure: "Pradeep Gyawali", competitors: ["UML", "NC"] },
    "Palpa": { name: "Palpa", province: "Lumbini", headquarters: "Tansen", constituencies: 2, totalVotersEst: 200000, stronghold: "UML Lean", keyFigure: "", competitors: ["UML", "NC"] },
    "Rupandehi": { name: "Rupandehi", province: "Lumbini", headquarters: "Bhairahawa", constituencies: 5, totalVotersEst: 650000, stronghold: "UML/RPP Stronghold", keyFigure: "Bishnu Paudel", competitors: ["UML", "RPP", "NC"] },
    "Kapilvastu": { name: "Kapilvastu", province: "Lumbini", headquarters: "Taulihawa", constituencies: 3, totalVotersEst: 380000, stronghold: "Competitive", keyFigure: "", competitors: ["NC", "UML", "JSP"] },
    "Arghakhanchi": { name: "Arghakhanchi", province: "Lumbini", headquarters: "Sandhikharka", constituencies: 1, totalVotersEst: 160000, stronghold: "UML Lean", keyFigure: "Top Bahadur Rayamajhi", competitors: ["UML", "NC"] },
    "Pyuthan": { name: "Pyuthan", province: "Lumbini", headquarters: "Pyuthan", constituencies: 1, totalVotersEst: 150000, stronghold: "UML/Maoist", keyFigure: "", competitors: ["UML", "Maoist"] },
    "Rolpa": { name: "Rolpa", province: "Lumbini", headquarters: "Liwang", constituencies: 1, totalVotersEst: 140000, stronghold: "Maoist Fortress", keyFigure: "Barshaman Pun", competitors: ["Maoist", "NC"] },
    "Eastern Rukum": { name: "Eastern Rukum", province: "Lumbini", headquarters: "Rukumkot", constituencies: 1, totalVotersEst: 35000, stronghold: "Maoist Stronghold", keyFigure: "", competitors: ["Maoist", "NC"] },
    "Dang": { name: "Dang", province: "Lumbini", headquarters: "Ghorahi", constituencies: 3, totalVotersEst: 420000, stronghold: "Maoist/UML Competitive", keyFigure: "Shankar Pokhrel", competitors: ["UML", "Maoist", "NC"] },
    "Banke": { name: "Banke", province: "Lumbini", headquarters: "Nepalgunj", constituencies: 3, totalVotersEst: 360000, stronghold: "NC/RPP Lean", keyFigure: "Dhawal Shamsher Rana", competitors: ["RPP", "NC", "UML"] },
    "Bardiya": { name: "Bardiya", province: "Lumbini", headquarters: "Gulariya", constituencies: 2, totalVotersEst: 310000, stronghold: "Competitive", keyFigure: "Bam Dev Gautam (History)", competitors: ["NC", "UML", "Maoist"] },
    "Parasi": { name: "Parasi", province: "Lumbini", headquarters: "Ramgram", constituencies: 2, totalVotersEst: 240000, stronghold: "NC Lean", keyFigure: "Binod Chaudhary", competitors: ["NC", "UML"] },

    // === Karnali Province ===
    "Dolpa": { name: "Dolpa", province: "Karnali", headquarters: "Dunai", constituencies: 1, totalVotersEst: 22000, stronghold: "Unified Socialist/Maoist", keyFigure: "", competitors: ["US", "Maoist"] },
    "Mugu": { name: "Mugu", province: "Karnali", headquarters: "Gamgadhi", constituencies: 1, totalVotersEst: 35000, stronghold: "NC Lean", keyFigure: "", competitors: ["NC", "UML"] },
    "Humla": { name: "Humla", province: "Karnali", headquarters: "Simikot", constituencies: 1, totalVotersEst: 32000, stronghold: "Maoist Lean", keyFigure: "", competitors: ["Maoist", "NC"] },
    "Jumla": { name: "Jumla", province: "Karnali", headquarters: "Khalanga", constituencies: 1, totalVotersEst: 68000, stronghold: "RPP/Maoist", keyFigure: "Gyanendra Shahi", competitors: ["RPP", "Maoist"] },
    "Kalikot": { name: "Kalikot", province: "Karnali", headquarters: "Manma", constituencies: 1, totalVotersEst: 80000, stronghold: "Maoist Stronghold", keyFigure: "Mahendra Bahadur Shahi", competitors: ["Maoist", "UML"] },
    "Dailekh": { name: "Dailekh", province: "Karnali", headquarters: "Dailekh", constituencies: 2, totalVotersEst: 160000, stronghold: "UML Lean", keyFigure: "", competitors: ["UML", "NC"] },
    "Jajarkot": { name: "Jajarkot", province: "Karnali", headquarters: "Khalanga", constituencies: 1, totalVotersEst: 95000, stronghold: "Maoist Stronghold", keyFigure: "Shakti Basnet", competitors: ["Maoist", "NC"] },
    "Western Rukum": { name: "Western Rukum", province: "Karnali", headquarters: "Musikot", constituencies: 1, totalVotersEst: 105000, stronghold: "Maoist Fortress", keyFigure: "Janardan Sharma", competitors: ["Maoist", "NC"] },
    "Salyan": { name: "Salyan", province: "Karnali", headquarters: "Salyan", constituencies: 1, totalVotersEst: 155000, stronghold: "Unified Socialist Lean", keyFigure: "Prakash Jwala", competitors: ["US", "UML"] },
    "Surkhet": { name: "Surkhet", province: "Karnali", headquarters: "Birendranagar", constituencies: 2, totalVotersEst: 240000, stronghold: "NC Stronghold", keyFigure: "Purna Bahadur Khadka", competitors: ["NC", "UML"] },

    // === Sudurpashchim Province ===
    "Bajura": { name: "Bajura", province: "Sudurpashchim", headquarters: "Martadi", constituencies: 1, totalVotersEst: 85000, stronghold: "NC Lean", keyFigure: "Badri Pandey", competitors: ["NC", "UML"] },
    "Bajhang": { name: "Bajhang", province: "Sudurpashchim", headquarters: "Chainpur", constituencies: 1, totalVotersEst: 120000, stronghold: "UML Lean", keyFigure: "", competitors: ["UML", "NC"] },
    "Darchula": { name: "Darchula", province: "Sudurpashchim", headquarters: "Khalanga", constituencies: 1, totalVotersEst: 90000, stronghold: "NC Lean", keyFigure: "Dilendra Prasad Badu", competitors: ["NC", "UML"] },
    "Baitadi": { name: "Baitadi", province: "Sudurpashchim", headquarters: "Gothalapani", constituencies: 1, totalVotersEst: 150000, stronghold: "UML Lean", keyFigure: "Damodar Bhandari", competitors: ["UML", "NC"] },
    "Dadeldhura": { name: "Dadeldhura", province: "Sudurpashchim", headquarters: "Dadeldhura", constituencies: 1, totalVotersEst: 95000, stronghold: "NC Fortress", keyFigure: "Sher Bahadur Deuba", competitors: ["NC", "Indep"] },
    "Doti": { name: "Doti", province: "Sudurpashchim", headquarters: "Silgadhi", constituencies: 1, totalVotersEst: 125000, stronghold: "Unified Socialist/NC", keyFigure: "Prem Ale", competitors: ["US", "NC", "UML"] },
    "Achham": { name: "Achham", province: "Sudurpashchim", headquarters: "Mangalsen", constituencies: 2, totalVotersEst: 170000, stronghold: "UML/NC", keyFigure: "Bhim Rawal (Influence)", competitors: ["UML", "NC"] },
    "Kailali": { name: "Kailali", province: "Sudurpashchim", headquarters: "Dhangadhi", constituencies: 5, totalVotersEst: 550000, stronghold: "Nagarik Unmukti/NC", keyFigure: "Resham Chaudhary (Influence)", competitors: ["NUP", "NC", "UML"] },
    "Kanchanpur": { name: "Kanchanpur", province: "Sudurpashchim", headquarters: "Mahendranagar", constituencies: 3, totalVotersEst: 310000, stronghold: "NC Stronghold", keyFigure: "Ramesh Lekhak", competitors: ["NC", "UML"] }
};
