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
 * - “Election 2026” corresponds to the early general election for the House of Representatives
 *   scheduled for 5 March 2026 (2082 Falgun 21). [web:1][web:5][web:8][web:14]
 * - The Election Commission has already published updated voter-roll figures and related stats
 *   ahead of this election; some are final, some are described as near-final with “minor adjustments”
 *   expected. [web:6][web:9][web:12]
 * - For 2022 and 2022-local, figures are final official results from ECN/IFES/Wikipedia synthesis. [web:7][web:10][web:13]
 */

const RAW_SNAPSHOT_STATS: RawElectionSnapshotStat[] = [
    // --- 2026 / 2082 General Election (upcoming) ---

    {
        id: "election-date-2026-general",
        icon: "calendar",
        label: { en: "Election Date (HoR 2026)", ne: "निर्वाचन मिति (प्रतिनिधि सभा २०२६)" },
        value_en: "5 March 2026 (2082 Falgun 21)",
        value_ne: "२०२६ मार्च ५ (२०८२ फागुन २१)",
        hint: {
            en: "Date of the early general election to elect 275 members of the House of Representatives",
            ne: "प्रतिनिधि सभा (२७५ सदस्य) को लागि हुने पूर्वनिर्धारित आम निर्वाचनको मिति",
        },
        source: {
            en: "EC schedule • 2026",
            ne: "निर्वाचन कार्यक्रम • २०८२",
        },
        href: "https://election.gov.np",
        evidence_line:
            "Early general elections are to be held on 5 March 2026 to elect 275 members of the House of Representatives.",
    },

    {
        id: "registered-voters-2026-general-final-roll",
        icon: "users",
        label: { en: "Registered Voters (Final Roll 2025/26)", ne: "दर्ता मतदाता (अन्तिम नामावली २०८२)" },
        value_en: "18,903,689",
        value_ne: "१,८९,०३,६८९",
        hint: {
            en: "Total voters in the final nationwide voter list published ahead of the 2026 general election",
            ne: "२०२६ आम निर्वाचनअगाडि प्रकाशित अन्तिम मतदाता नामावली अनुसारको कुल मतदाता संख्या",
        },
        source: {
            en: "EC final voters’ roll • Dec 2025",
            ne: "निर्वाचन आयोग अन्तिम मतदाता नामावली • पुस २०८२",
        },
        href: "https://election.gov.np",
        evidence_line:
            "On 27 December 2025, the Election Commission published a final voter list of 18,903,689 voters.",
    },

    {
        id: "registered-voters-2026-general-expanded",
        icon: "users",
        label: { en: "Registered Voters (updated with Gen Z expansion)", ne: "दर्ता मतदाता (Gen Z विस्तारपछि)" },
        value_en: "19,005,324",
        value_ne: "१,९०,०५,३२४",
        hint: {
            en: "Approximate total voters after additional registration rounds and Gen Z-focused updates for the March 2026 election",
            ne: "Gen Z केन्द्रित थप दर्ता अभियानपछि २०२६ आम निर्वाचनका लागि अद्यावधिक अनुमानित मतदाता संख्या",
        },
        source: {
            en: "EC officials via national media • Nov 2025",
            ne: "निर्वाचन आयोग अधिकारीहरूको भनाइ • मंसिर २०८२",
        },
        href: "https://english.onlinekhabar.com/one-million-voter-added-for-election.html",
        evidence_line:
            "The number of voters has reached 19,005,324; in the 2022 election there were 17,988,570 voters.",
    },

    {
        id: "new-voters-added-2026-general",
        icon: "activity",
        label: { en: "New Voters since 2022", ne: "२०७९ पछि थपिएको नयाँ मतदाता" },
        value_en: "≈1,016,754",
        value_ne: "झण्डै १०,१६,७५४",
        hint: {
            en: "Approximate number of additional voters added to the roll since the 2022 House of Representatives election",
            ne: "२०७९ प्रतिनिधि सभा निर्वाचनपछिको मतदाता नामावली अद्यावधिकमा थपिएको अनुमानित नयाँ मतदाता संख्या",
        },
        source: {
            en: "EC data via Onlinekhabar • Nov 2025",
            ne: "अनलाइनखबरमार्फत आयोग तथ्यांक • मंसिर २०८२",
        },
        href: "https://english.onlinekhabar.com/one-million-voter-added-for-election.html",
        evidence_line:
            "This time, 1,016,754 additional voters have been added, bringing the total to 19,005,324.",
    },

    {
        id: "extended-registration-additions-2026",
        icon: "users",
        label: { en: "Voters from Extended Registration", ne: "विस्तारित दर्ताबाट थप मतदाता" },
        value_en: "837,094",
        value_ne: "८,३७,०९४",
        hint: {
            en: "Voters added in the last extended round of voter-roll updates ahead of the March 2026 election",
            ne: "२०२६ निर्वाचनअघिको अन्तिम विस्तारित मतदाता दर्ता चरणबाट थपिएका मतदाता संख्या",
        },
        source: {
            en: "EC announcement • Nov 2025",
            ne: "निर्वाचन आयोग सूचना • मंसिर २०८२",
        },
        href: "https://www.tribuneindia.com/news/world/nepal-adds-more-than-800000-new-voters-in-latest-round-of-roll-update-ahead-of-march-ele-470000",
        evidence_line:
            "A total of 8,37,094 new voters has been added to the electoral roll following the completion of extended voter registration.",
    },

    {
        id: "biometric-vs-nid-registration-2026",
        icon: "fileSearch",
        label: { en: "Mode of New Registration", ne: "नयाँ दर्ताको विधि" },
        value_en: "344,914 biometric; 492,180 via National ID",
        value_ne: "३,४४,९१४ बायोमेट्रिक; ४,९२,१८० राष्ट्रिय परिचयपत्रको आधारमा",
        hint: {
            en: "Breakdown of new voters added through full biometric capture vs National ID integration in the latest update",
            ne: "भर्खरको अद्यावधिकमा बायोमेट्रिक विवरणमार्फत र राष्ट्रिय परिचयपत्र समायोजनमार्फत थपिएका मतदाताको विवरण",
        },
        source: {
            en: "EC, voter-roll update • Nov 2025",
            ne: "निर्वाचन आयोग, मतदाता नामावली अद्यावधिक • मंसिर २०८२",
        },
        href: "https://www.tribuneindia.com/news/world/nepal-adds-more-than-800000-new-voters-in-latest-round-of-roll-update-ahead-of-march-ele-470000",
        evidence_line:
            "344,914 registered through full biometrics, while 492,180 were added via their National Identity Cards.",
    },

    {
        id: "eligible-voters-as-of-nov-2025",
        icon: "users",
        label: { en: "Eligible Voters (as of Nov 2025)", ne: "योग्य मतदाता (मंसिर २०८२ सम्म)" },
        value_en: "18,168,023",
        value_ne: "१,८१,६८,०२३",
        hint: {
            en: "Number of eligible voters aged 18+ recorded just before the final extension of registration",
            ne: "अन्तिम विस्तारित दर्ता अवधि अघि १८ वर्षभन्दा माथिका योग्य मतदाताको संख्या",
        },
        source: {
            en: "EC data via ANI • Nov 2025",
            ne: "एएनआईमार्फत आयोग तथ्यांक • मंसिर २०८२",
        },
        href: "https://www.tribuneindia.com/news/world/nepal-adds-more-than-800000-new-voters-in-latest-round-of-roll-update-ahead-of-march-ele-470000",
        evidence_line:
            "As of November 2, Nepal had 18,168,023 eligible voters aged 18 and above.",
    },

    {
        id: "voter-registration-cutoff-2026",
        icon: "calendar",
        label: { en: "Cutoff for Voter Eligibility", ne: "मतदाता योग्यता कटअफ मिति" },
        value_en: "Must be 18 by 4 March 2026 (2082 Falgun 21)",
        value_ne: "२०२६ मार्च ४ (२०८२ फागुन २१) भित्र १८ वर्ष पूरा हुनुपर्ने",
        hint: {
            en: "Legal provision allowing citizens who turn 18 by the eve of polling to register as voters",
            ne: "मतदान मितिको अघिल्लो दिनभित्र १८ वर्ष पुगेका नागरिकलाई दर्ता गर्न दिइने कानुनी व्यवस्था",
        },
        source: {
            en: "Ordinance on voter-roll update • 2082",
            ne: "मतदाता नामावली अद्यावधिक सम्बन्धी अध्यादेश • २०८२",
        },
        href: "https://www.tribuneindia.com/news/world/nepal-adds-more-than-800000-new-voters-in-latest-round-of-roll-update-ahead-of-march-ele-470000",
        evidence_line:
            "As per the ordinance any Nepali citizen who turns 18 by March 4, 2026, can register.",
    },

    {
        id: "parties-registered-2026-general",
        icon: "fileText",
        label: { en: "Parties Registered for 2026 HoR Polls", ne: "२०२६ प्रतिनिधि सभा निर्वाचनका दर्ता दल" },
        value_en: "114 parties",
        value_ne: "११४ दल",
        hint: {
            en: "Number of political parties registered to take part in the House of Representatives election",
            ne: "प्रतिनिधि सभा निर्वाचनमा सहभागी हुन निर्वाचन आयोगमा दर्ता भएका राजनीतिक दल संख्या",
        },
        source: {
            en: "Republica / Anadolu citing ECN • Dec 2025",
            ne: "रिपब्लिका / आनाडोलु • पुस २०८२",
        },
        href: "https://www.aa.com.tr/en/asia-pacific/nepal-gears-up-for-general-elections-next-year-with-114-parties-registered-for-polls/3766870",
        evidence_line:
            "Nepal is preparing to hold general elections on March 5 with 114 political parties out of 143 registered with the Election Commission taking part.",
    },

    {
        id: "total-seats-hor-system-2026",
        icon: "activity",
        label: { en: "House of Representatives Seats & System", ne: "प्रतिनिधि सभा सिट र प्रणाली" },
        value_en: "275 seats (165 FPTP, 110 PR)",
        value_ne: "२७५ सिट (१६५ प्रत्यक्ष, ११० समानुपातिक)",
        hint: {
            en: "Composition of the House: 165 elected through FPTP constituencies and 110 through proportional representation",
            ne: "प्रतिनिधि सभामा १६५ सदस्य प्रत्यक्ष निर्वाचन (FPTP) र ११० सदस्य समानुपातिक प्रतिनिधित्व प्रणालीबाट निर्वाचित",
        },
        source: {
            en: "Constitutional framework & ECN explainer",
            ne: "संवैधानिक व्यवस्था र निर्वाचन आयोग विवरण",
        },
        href: "https://www.youtube.com/watch?v=mZ-4Lwg_WB4",
        evidence_line:
            "Of the 275 seats in the lower house, 165 are elected through the first-past-the-post system, 110 are allocated based on proportional representation.",
    },

    {
        id: "campaign-period-2026",
        icon: "calendar",
        label: { en: "Campaign & Silence Period (2026)", ne: "प्रचार अवधि र मौन अवधि (२०२६)" },
        value_en: "Campaign: mid-Feb 2026 (2 weeks); 2-day silence before 5 March",
        value_ne: "प्रचार: फागुन २ आसपासदेखि करिब २ हप्ता; मतदानअघि २ दिन मौन अवधि",
        hint: {
            en: "Indicative campaign window and mandatory silence period immediately before polling day",
            ne: "मतदान मिति अगाडि रहने निर्वाचन प्रचार-प्रसार अवधि र कानुनी मौन अवधिको व्यवस्था",
        },
        source: {
            en: "EC schedule briefing • Oct 2025",
            ne: "निर्वाचन कार्यक्रम जानकारी • असोज/कात्तिक २०८२",
        },
        href: "https://www.youtube.com/watch?v=mZ-4Lwg_WB4",
        evidence_line:
            "The election commission has scheduled a two-week period starting from the 15th of February 2026 for campaigning and two days of silence before voting on 5 March.",
    },

    {
        id: "voter-roll-growth-2017-2022-2026",
        icon: "activity",
        label: { en: "Voter-Roll Growth (2017→2022→2026)", ne: "मतदाता वृद्धि (२०७४→२०७९→२०८२)" },
        value_en: "2017: 15,427,731 → 2022: 17,988,570 → 2026: ~19,0M",
        value_ne: "२०७४: १,५४,२७,७३१ → २०७९: १,७९,८८,५७० → २०८२: करिब १,९०,००,०००",
        hint: {
            en: "Trend of increasing registered voters over the last three House elections",
            ne: "अन्तिम तीन प्रतिनिधि सभा निर्वाचनबीच दर्ता मतदाताको वृद्धि दरको संकेत",
        },
        source: {
            en: "EC/IFES data 2017 & 2022; ECN & media 2026",
            ne: "निर्वाचन आयोग/IFES २०१७ र २०२२; आयोग/सञ्चारमाध्यम २०२६",
        },
        href: "https://english.onlinekhabar.com/one-million-voter-added-for-election.html",
        evidence_line:
            "In the 2017 election eligible voters were 15,427,731; in 2022, 17,988,570; for March 5 election voter numbers have risen to around 19,005,324.",
    },

    // --- 2022 / 2079 Federal (HoR) Election – reference baseline ---

    {
        id: "registered-voters-2022-general",
        icon: "users",
        label: { en: "Registered Voters (HoR 2022)", ne: "दर्ता मतदाता (प्रतिनिधि सभा २०७९)" },
        value_en: "17,988,570",
        value_ne: "१,७९,८८,५७०",
        hint: {
            en: "Total registered voters for the 2022 federal and provincial elections",
            ne: "२०७९ प्रतिनिधि सभा तथा प्रदेशसभा निर्वाचनका लागि दर्ता भएका कुल मतदाता",
        },
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Registered voters/turnout: 17,988,570.",
    },

    {
        id: "total-votes-pr-2022",
        icon: "activity",
        label: { en: "Total PR Votes Cast (2022)", ne: "समानुपातिकमा खसेको कुल मत (२०७९)" },
        value_en: "11,126,226",
        value_ne: "१,११,२६,२२६",
        hint: {
            en: "Total votes cast in the proportional representation ballot for the 2022 election",
            ne: "२०७९ प्रतिनिधि सभा समानुपातिक मतपत्रमा खसेको कुल मत",
        },
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Total PR votes: 11,126,226.",
    },

    {
        id: "valid-votes-pr-2022",
        icon: "fileSearch",
        label: { en: "Valid PR Votes (2022)", ne: "समानुपातिक सदर मत (२०७९)" },
        value_en: "10,560,082",
        value_ne: "१,०५,६०,०८२",
        hint: {
            en: "Number of valid proportional representation votes in the 2022 election",
            ne: "२०७९ समानुपातिक प्रतिनिधि सभा निर्वाचनमा सदर भएको मत संख्या",
        },
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Valid PR votes: 10,560,082 (94.91% of total PR votes).",
    },

    {
        id: "invalid-votes-pr-2022",
        icon: "scale",
        label: { en: "Invalid/Blank PR Votes (2022)", ne: "समानुपातिक बदर/खाली मत (२०७९)" },
        value_en: "566,144",
        value_ne: "५,६६,१४४",
        hint: {
            en: "Number of invalid or blank PR ballots in the 2022 election",
            ne: "२०७९ समानुपातिक मतपत्रमा बदर वा खाली रहेको मत संख्या",
        },
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Invalid/blank PR votes: 566,144 (5.09%).",
    },

    {
        id: "total-votes-fptp-2022",
        icon: "activity",
        label: { en: "Total FPTP Votes Cast (2022)", ne: "प्रत्यक्षमा खसेको कुल मत (२०७९)" },
        value_en: "11,047,037",
        value_ne: "१,१०,४७,०३७",
        hint: {
            en: "Total votes cast under FPTP for the 2022 House of Representatives election",
            ne: "२०७९ प्रतिनिधि सभा प्रत्यक्ष निर्वाचनमा खसेको कुल मत",
        },
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Total FPTP votes: 11,047,037.",
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
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Valid FPTP votes: 10,487,961 (94.94%).",
    },

    {
        id: "invalid-votes-fptp-2022",
        icon: "scale",
        label: { en: "Invalid/Blank FPTP Votes (2022)", ne: "प्रत्यक्ष बदर/खाली मत (२०७९)" },
        value_en: "559,076",
        value_ne: "५,५९,०७६",
        hint: {
            en: "Number of invalid or blank FPTP ballots in the 2022 election",
            ne: "२०७९ प्रत्यक्ष मतपत्रमा बदर वा खाली रहेको मत संख्या",
        },
        source: { en: "Election Commission Nepal • 2022", ne: "निर्वाचन आयोग नेपाल • २०७९" },
        href: "https://en.wikipedia.org/wiki/2022_Nepalese_general_election",
        evidence_line: "Invalid/blank FPTP votes: 559,076 (5.06%).",
    },

    // --- 2022 / 2079 Local Election – voter baseline for local level ---

    {
        id: "registered-voters-2022-local",
        icon: "users",
        label: { en: "Registered Voters (Local 2022)", ne: "दर्ता मतदाता (स्थानीय तह २०७९)" },
        value_en: "17,733,723",
        value_ne: "१,७७,३३,७२३",
        hint: {
            en: "Total registered voters for the 2022 local elections",
            ne: "२०७९ स्थानीय तह निर्वाचनका लागि दर्ता भएका कुल मतदाता",
        },
        source: { en: "IFES, quoting ECN • 2022", ne: "IFES (निर्वाचन आयोग उद्धृत) • २०७९" },
        href: "https://www.ifes.org/sites/default/files/migrate/ifes_faqs_elections_in_nepal_2022_local_elections_0.pdf",
        evidence_line: "Registered voters: 17,733,723 (local elections).",
    },

    {
        id: "male-female-other-voters-2022-local",
        icon: "users",
        label: { en: "Gender Breakdown (Local 2022)", ne: "लैंगिक वितरण (स्थानीय २०७९)" },
        value_en: "Male: 8,992,010; Female: 8,741,530; Other: 183",
        value_ne: "पुरुष: ८९,९२,०१०; महिला: ८७,४१,५३०; अन्य: १८३",
        hint: {
            en: "Gender-wise distribution of registered voters for the 2022 local elections",
            ne: "२०७९ स्थानीय निर्वाचनका लागि दर्ता मतदाताको लैंगिक विवरण",
        },
        source: { en: "IFES, quoting ECN • 2022", ne: "IFES (निर्वाचन आयोग उद्धृत) • २०७९" },
        href: "https://www.ifes.org/sites/default/files/migrate/ifes_faqs_elections_in_nepal_2022_local_elections_0.pdf",
        evidence_line:
            "There are 17,733,723 registered voters: 8,992,010 men, 8,741,530 women and 183 individuals identifying as “other.”",
    },

    {
        id: "polling-stations-2022-local",
        icon: "fileText",
        label: { en: "Polling Stations (Local 2022)", ne: "मतदान केन्द्र (स्थानीय २०७९)" },
        value_en: "At least one per ward; 10,756 wards nationwide",
        value_ne: "प्रत्येक वडा कम्तीमा १; जम्मा १०,७५६ वडाहरूमा मतदान केन्द्र",
        hint: {
            en: "Each ward in Nepal had at least one polling station during the 2022 local elections",
            ne: "२०७९ स्थानीय निर्वाचनमा नेपालका प्रत्येक वडामा कम्तीमा एक मतदान केन्द्र स्थापना गरिएको व्यवस्था",
        },
        source: { en: "IFES FAQs • 2022", ne: "IFES चुनाव विवरण • २०७९" },
        href: "https://www.ifes.org/sites/default/files/migrate/ifes_faqs_elections_in_nepal_2022_local_elections_0.pdf",
        evidence_line: "Each ward, the smallest local unit in Nepal, will have at least one polling station.",
    },

    {
        id: "registered-voters-2022-federal-gender",
        icon: "users",
        label: { en: "Gender Breakdown (HoR 2022)", ne: "लैंगिक वितरण (प्रतिनिधि सभा २०७९)" },
        value_en: "Male: 9,140,806; Female: 8,847,579; Other: 185",
        value_ne: "पुरुष: ९१,४०,८०६; महिला: ८८,४७,५७९; अन्य: १८५",
        hint: {
            en: "Gender-wise registered voters for the 2022 federal (House of Representatives) election",
            ne: "२०७९ संघीय (प्रतिनिधि सभा) निर्वाचनका लागि दर्ता मतदाताको लैंगिक वितरण",
        },
        source: { en: "IFES, quoting ECN • 2022", ne: "IFES (निर्वाचन आयोग उद्धृत) • २०७९" },
        href: "https://www.ifes.org/sites/default/files/2022-11/IFES_Nepal_Federal_and_Provincial_Elections_2022_FAQ_1.pdf",
        evidence_line:
            "There were 17,988,570 registered voters: 9,140,806 men, 8,847,579 women and 185 other.",
    },
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
