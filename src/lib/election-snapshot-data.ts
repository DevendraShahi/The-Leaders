// यो फाइलले नेपालको आगामी प्रतिनिधि सभा निर्वाचन २०२६ (२०८२ वि.सं.) र अघिल्ला निर्वाचनका अद्यावधिक तथा प्रमाणित तथ्याङ्कहरू समावेश गर्दछ।

export type SnapshotLanguage = "en" | "ne";

type Localized = { en: string; ne: string };

export type SnapshotIconKey =
    | "calendar"
    | "scale"
    | "users"
    | "fileText"
    | "printer"
    | "activity"
    | "fileSearch";

interface RawElectionSnapshotStat {
    id: string;
    icon: SnapshotIconKey;
    label: Localized;
    value_en: string;
    value_ne: string;
    hint: Localized;
    source: Localized;
    href: string;
    evidence_line: string;
}

export interface ElectionSnapshotStat {
    id: string;
    icon: SnapshotIconKey;
    label: Localized;
    value: string;
    hint: Localized;
    source: Localized;
    href: string;
    evidenceLine: string;
}

/**
 * NOTE:
 * - "Election 2026" corresponds to the snap general election for the House of Representatives
 * scheduled for 5 March 2026 (21 Falgun 2082 BS).
 * - Triggered by the September 2025 "Gen-Z" anti-corruption protests that led to the fall of the Oli government.
 * - All sources below have been verified with live, working links as of February 2026.
 */

const RAW_SNAPSHOT_STATS: RawElectionSnapshotStat[] = [
    // --- 2026 / 2082 General Election (Upcoming Snap Election) ---

    {
        id: "election-date-2026-general",
        icon: "calendar",
        label: { en: "Election Date (HoR 2026)", ne: "निर्वाचन मिति (प्रतिनिधि सभा २०२६)" },
        value_en: "5 March 2026 (21 Falgun 2082)",
        value_ne: "२०२६ मार्च ५ (२०८२ फागुन २१)",
        hint: {
            en: "Date of the snap general election called by Interim PM Sushila Karki",
            ne: "अन्तरिम प्रधानमन्त्री सुशीला कार्कीद्वारा घोषणा गरिएको आम निर्वाचनको मिति",
        },
        source: {
            en: "Wikipedia • 2026 Election",
            ne: "विकिपिडिया • २०२६ निर्वाचन",
        },
        href: "https://en.wikipedia.org/wiki/2026_Nepalese_general_election",
        evidence_line: "President Ram Chandra Poudel announced that elections would be held on 5 March 2026.",
    },

    {
        id: "election-trigger-2026",
        icon: "activity",
        label: { en: "Election Catalyst", ne: "निर्वाचनको कारण" },
        value_en: "Sept 2025 Gen-Z Protests",
        value_ne: "सेप्टेम्बर २०२५ को 'जेन-जी' आन्दोलन",
        hint: {
            en: "The protests against corruption and social media bans that led to parliament dissolution",
            ne: "भ्रष्टाचार र सामाजिक सञ्जाल प्रतिबन्धविरुद्धको आन्दोलन जसले संसद विघटन निम्त्यायो",
        },
        source: {
            en: "Engelsberg Ideas • Feb 2026",
            ne: "एंगेल्सबर्ग आइडियाज • फेब्रुअरी २०२६",
        },
        href: "https://engelsbergideas.com/notebook/nepals-road-to-revolution/",
        evidence_line: "That very day, she [Sushila Karki] dissolved the Parliament and announced fresh elections for March 2026. In the aftermath of the events of September, the 'Gen-Z revolution' has been officially heralded...",
    },

    {
        id: "registered-voters-2026-general",
        icon: "users",
        label: { en: "Registered Voters (2026)", ne: "दर्ता मतदाता (२०२६)" },
        value_en: "18,903,689",
        value_ne: "१,८९,०३,६८९",
        hint: {
            en: "Final number of eligible voters published by the Election Commission",
            ne: "निर्वाचन आयोगद्वारा प्रकाशित योग्य मतदाताहरूको अन्तिम संख्या",
        },
        source: {
            en: "Wikipedia • 2026 Election",
            ne: "विकिपिडिया • २०२६ निर्वाचन",
        },
        href: "https://en.wikipedia.org/wiki/2026_Nepalese_general_election",
        evidence_line: "On 27 December 2025, the Election Commission published a final voter list of 18,903,689 voters.",
    },

    {
        id: "security-deployment-2026",
        icon: "scale",
        label: { en: "Security Personnel Deployed", ne: "परिचालित सुरक्षाकर्मी" },
        value_en: "320,000",
        value_ne: "३,२०,०००",
        hint: {
            en: "Total security personnel (Police, Armed Police, Army) deployed for the election",
            ne: "निर्वाचन सुरक्षाका लागि खटिएका कुल सुरक्षाकर्मी (नेपाल प्रहरी, सशस्त्र प्रहरी, नेपाली सेना)",
        },
        source: {
            en: "MP-IDSA Analysis • Feb 2026",
            ne: "MP-IDSA विश्लेषण • फेब्रुअरी २०२६",
        },
        href: "https://idsa.in/publisher/comments/power-without-majority-nepal-2026",
        evidence_line: "A total of 320,000 security personnel have been deployed to uphold law and order until the election concludes.",
    },

    {
        id: "polling-booths-2026",
        icon: "fileText",
        label: { en: "Total Polling Booths", ne: "कुल मतदान केन्द्र" },
        value_en: "11,901",
        value_ne: "११,९०१",
        hint: {
            en: "Total polling booths, including 4,614 highly sensitive and 4,442 sensitive locations",
            ne: "कुल मतदान केन्द्रहरू (४,६१४ अति संवेदनशील र ४,४४२ संवेदनशील सहित)",
        },
        source: {
            en: "MP-IDSA Analysis • Feb 2026",
            ne: "MP-IDSA विश्लेषण • फेब्रुअरी २०२६",
        },
        href: "https://idsa.in/publisher/comments/power-without-majority-nepal-2026",
        evidence_line: "The Election Commission reports that of 11,901 polling booths, 4,614 are classified as highly sensitive and 4,442 as sensitive.",
    },

    {
        id: "contesting-parties-2026",
        icon: "users",
        label: { en: "Parties in FPTP Race", ne: "प्रत्यक्षतर्फ प्रतिस्पर्धी दलहरू" },
        value_en: "121 (out of 143 registered)",
        value_ne: "१२१ (१४३ दर्ता भएका मध्ये)",
        hint: {
            en: "Number of political parties registered under the First Past the Post (FPTP) system",
            ne: "प्रत्यक्ष (FPTP) प्रणाली अन्तर्गत दर्ता भएका राजनीतिक दलहरूको संख्या",
        },
        source: {
            en: "MP-IDSA Analysis • Feb 2026",
            ne: "MP-IDSA विश्लेषण • फेब्रुअरी २०२६",
        },
        href: "https://idsa.in/publisher/comments/power-without-majority-nepal-2026",
        evidence_line: "According to the Election Commission, of the 143 registered political parties in Nepal, 121 registered under the First Past the Post (FPTP) system...",
    },

    {
        id: "campaign-window-2026",
        icon: "calendar",
        label: { en: "Campaign Window", ne: "प्रचारप्रसार अवधि" },
        value_en: "Ends 2 March 2026",
        value_ne: "मार्च २, २०२६ मा समाप्त",
        hint: {
            en: "Rallies and physical campaigning permitted starting 15 days prior until March 2",
            ne: "निर्वाचनको १५ दिन अघिदेखि मार्च २ सम्म र्‍याली र भौतिक प्रचारप्रसार गर्न अनुमति",
        },
        source: {
            en: "MP-IDSA Analysis • Feb 2026",
            ne: "MP-IDSA विश्लेषण • फेब्रुअरी २०२६",
        },
        href: "https://idsa.in/publisher/comments/power-without-majority-nepal-2026",
        evidence_line: "The Election Commission's 64-point directive allows candidates and parties to hold rallies and publish materials starting 15 days before the election, enabling campaign activities until 2 March.",
    },

    {
        id: "code-of-conduct-2026",
        icon: "fileSearch",
        label: { en: "Election Code of Conduct", ne: "निर्वाचन आचारसंहिता" },
        value_en: "Effective 18 Jan 2026",
        value_ne: "जनवरी १८, २०२६ देखि लागू",
        hint: {
            en: "Strict new code addressing digital misconduct, hate speech, and campaign spending",
            ne: "डिजिटल दुराचार, घृणायुक्त अभिव्यक्ति र निर्वाचन खर्चलाई सम्बोधन गर्ने कडा नयाँ आचारसंहिता",
        },
        source: {
            en: "NepalLaws • Feb 2026",
            ne: "नेपाल लज • फेब्रुअरी २०२६",
        },
        href: "https://nepallaws.com/election/articles/the-challenge-of-enforcing-nepals-election-code-of-conduct/",
        evidence_line: "This code has been in effect since January 18, 2026, and are meant to maintain fairness, impartiality, transparency...",
    },

    {
        id: "total-seats-hor-system-2026",
        icon: "activity",
        label: { en: "House Seats & System", ne: "प्रतिनिधि सभा सिट र प्रणाली" },
        value_en: "275 seats (165 FPTP, 110 PR)",
        value_ne: "२७५ सिट (१६५ प्रत्यक्ष, ११० समानुपातिक)",
        hint: {
            en: "Composition of the House: 165 elected through FPTP and 110 through proportional representation",
            ne: "प्रतिनिधि सभामा १६५ सदस्य प्रत्यक्ष (FPTP) र ११० सदस्य समानुपातिक प्रतिनिधित्व प्रणालीबाट निर्वाचित",
        },
        source: {
            en: "NepalLaws • Upcoming Election",
            ne: "नेपाल लज • आगामी निर्वाचन",
        },
        href: "https://nepallaws.com/election/articles/understanding-nepals-upcoming-election-21-falgun-2082/",
        evidence_line: "This direct election fills 165 of the total 275 seats in the House. ... The second method is called the Proportional Representation (PR) system, which is used to elect the remaining 110 members.",
    },

    // --- 2022 / 2079 Federal (HoR) Election Baseline ---

    {
        id: "registered-voters-2022-general",
        icon: "users",
        label: { en: "Registered Voters (2022)", ne: "दर्ता मतदाता (२०७९)" },
        value_en: "17,988,570",
        value_ne: "१,७९,८८,५७०",
        hint: {
            en: "Total registered voters for the 2022 federal and provincial elections",
            ne: "२०७९ प्रतिनिधि सभा तथा प्रदेशसभा निर्वाचनका लागि दर्ता भएका कुल मतदाता",
        },
        source: { en: "IFES Nepal Report", ne: "IFES नेपाल रिपोर्ट" },
        href: "https://www.ifes.org/sites/default/files/2022-11/IFES_Nepal_Federal_and_Provincial_Elections_2022_FAQ_1.pdf",
        evidence_line: "There were 17,988,570 registered voters: 9,140,806 men, 8,847,579 women and 185 other.",
    },

    {
        id: "total-votes-pr-2022",
        icon: "activity",
        label: { en: "Total PR Votes (2022)", ne: "समानुपातिक कुल मत (२०७९)" },
        value_en: "11,126,226",
        value_ne: "१,११,२६,२२६",
        hint: {
            en: "Total votes cast in the proportional representation ballot for the 2022 election",
            ne: "२०७९ प्रतिनिधि सभा समानुपातिक मतपत्रमा खसेको कुल मत",
        },
        source: { en: "Wikipedia • 2022 Election", ne: "विकिपिडिया • २०२२ निर्वाचन" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Total PR votes: 11,126,226.",
    },

    {
        id: "valid-votes-fptp-2022",
        icon: "fileSearch",
        label: { en: "Valid FPTP Votes (2022)", ne: "प्रत्यक्ष सदर मत (२०७९)" },
        value_en: "10,487,961",
        value_ne: "१,०४,८७,९६१",
        hint: {
            en: "Number of valid FPTP votes counted in the 2022 House election",
            ne: "२०७९ प्रतिनिधि सभा प्रत्यक्ष निर्वाचनमा सदर भएको मत संख्या",
        },
        source: { en: "Wikipedia • 2022 Election", ne: "विकिपिडिया • २०२२ निर्वाचन" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Valid FPTP votes: 10,487,961 (94.94%).",
    },

    // --- 2022 / 2079 Local Election Baseline ---

    {
        id: "registered-voters-2022-local",
        icon: "users",
        label: { en: "Registered Voters (Local 2022)", ne: "दर्ता मतदाता (स्थानीय २०७९)" },
        value_en: "17,733,723",
        value_ne: "१,७७,३३,७२३",
        hint: {
            en: "Total registered voters for the 2022 local elections",
            ne: "२०७९ स्थानीय तह निर्वाचनका लागि दर्ता भएका कुल मतदाता",
        },
        source: { en: "IFES FAQs Report", ne: "IFES चुनाव विवरण" },
        href: "https://www.ifes.org/sites/default/files/migrate/ifes_faqs_elections_in_nepal_2022_local_elections_0.pdf",
        evidence_line: "Registered voters: 17,733,723 (local elections).",
    }
];

export function getElectionSnapshotStats(language: SnapshotLanguage): ElectionSnapshotStat[] {
    return RAW_SNAPSHOT_STATS.map((stat) => ({
        id: stat.id,
        icon: stat.icon,
        label: stat.label,
        value: language === "ne" ? stat.value_ne : stat.value_en,
        hint: stat.hint,
        source: stat.source,
        href: stat.href,
        evidenceLine: stat.evidence_line,
    }));
}