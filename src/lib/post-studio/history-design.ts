import { defaultPostDesign, type PostDesign, type PostFormat } from './types';
import { blankHistoryData, type HistoryData } from './history-data';
import { historyTemplate, historyStamp, type HistoryLanguage, type HistoryTemplateId } from './history-catalog';

/** Gallery samples are real, verifiable events with bilingual copy.
 * Each sample fills only the fields its template edits (see historyPromptFields).
 */
export type HistorySample = { template: HistoryTemplateId; data: HistoryData; headline: string; summary: string; category: string; author: string };

export const historySamples: Record<HistoryLanguage, HistorySample[]> = {
    en: [
        { template: 'on-this-day', headline: 'SUGAULI TREATY RATIFIED', summary: 'The 1816 treaty ended the Anglo-Nepalese war and set Nepal’s western boundary at the Kali River.', category: 'ON THIS DAY', author: 'The Leaders History Desk', data: { ...blankHistoryData('on-this-day'), year: '1816', dateLabel: '4 MARCH', subject: 'Treaty of Sugauli', role: 'Anglo-Nepalese War', place: 'Sugauli, Bihar', fact: 'The treaty ended the Anglo-Nepalese war and fixed Nepal’s western boundary at the Kali River.', sample: true } },
        { template: 'movement', headline: 'JANA ANDOLAN I', summary: 'A mass uprising forced the partyless panchayat system to open multiparty politics in April 1990.', category: 'MOVEMENT', author: 'The Leaders History Desk', data: { ...blankHistoryData('movement'), year: '1990', dateLabel: 'APRIL', subject: 'Jana Andolan I', role: 'People’s movement for multiparty rule', place: 'Nepal', fact: 'Weeks of strikes and street protests ended the panchayat system and restored multiparty politics.', sample: true } },
        { template: 'proclamation', headline: 'NEPAL BECOMES A REPUBLIC', summary: 'The first Constituent Assembly declared Nepal a federal democratic republic.', category: 'PROCLAMATION', author: 'The Leaders History Desk', data: { ...blankHistoryData('proclamation'), year: '2008', dateLabel: '28 MAY', subject: 'Abolition of the monarchy', role: 'Constituent Assembly declaration', place: 'Kathmandu, Nepal', fact: 'The first session of the Constituent Assembly voted the Shah dynasty out and declared Nepal a federal republic.', sample: true } },
        { template: 'first', headline: 'EVEREST’S FIRST SUCCESSFUL ASCENT', summary: 'Edmund Hillary and Tenzing Norgay reached the summit on 29 May 1953.', category: 'A FIRST TIME', author: 'The Leaders History Desk', data: { ...blankHistoryData('first'), year: '1953', dateLabel: '29 MAY', subject: 'Hillary and Norgay on Everest', role: 'First successful ascent of Everest', fact: 'The pair reached the world’s highest summit during the 1953 British expedition.', sample: true } },
        { template: 'cultural', headline: 'RABINDRANATH TAGORE WINS THE NOBEL', summary: 'Tagore became the first non-European to receive the Nobel Prize in Literature.', category: 'CULTURE & IDEAS', author: 'The Leaders History Desk', data: { ...blankHistoryData('cultural'), year: '1913', dateLabel: 'NOVEMBER', subject: 'Rabindranath Tagore', role: 'Nobel Prize in Literature', fact: 'Gitanjali and its English translation brought Tagore the 1913 Nobel Prize in Literature.', sample: true } },
        { template: 'born', headline: 'NELSON MANDELA IS BORN', summary: 'Born in Mvezo, Mandela would spend 27 years in prison and emerge to lead a democratic South Africa.', category: 'BORN ON THIS DAY', author: 'The Leaders History Desk', data: { ...blankHistoryData('born'), year: '1918', dateLabel: '18 JULY', subject: 'Nelson Mandela', role: 'Anti-apartheid leader · South Africa', lifespan: '1918 – 2013', place: 'Mvezo, South Africa', fact: 'He walked out of prison after 27 years and became South Africa’s first Black president in 1994.', sample: true } },
        { template: 'died', headline: 'IN MEMORIAM: MOTHER TERESA', summary: 'The missionary who founded the Missionaries of Charity in Kolkata died in 1997.', category: 'IN MEMORIAM', author: 'The Leaders History Desk', data: { ...blankHistoryData('died'), year: '1997', dateLabel: '5 SEPTEMBER', subject: 'Mother Teresa', role: 'Missionary · founder, Missionaries of Charity', lifespan: '1910 – 1997', place: 'Kolkata, India', fact: 'She received the Nobel Peace Prize in 1979 and was canonised as a saint in 2016.', sample: true } },
        { template: 'treaty', headline: 'THE END OF THE ANGLO-NEPALESE WAR', summary: 'The treaty was ratified in March 1816 after the Anglo-Nepalese War.', category: 'TREATY & AGREEMENT', author: 'The Leaders History Desk', data: { ...blankHistoryData('treaty'), year: '1816', dateLabel: '4 MARCH 1816', subject: 'Treaty of Sugauli', place: 'Sugauli, Bihar', fact: 'Nepal ceded Kumaon and Garhwal to the East India Company and agreed to a British resident in Kathmandu.', sample: true } },
        { template: 'flashback', headline: 'FROM THE ARCHIVES: 29 MAY 1953', summary: 'Edmund Hillary and Tenzing Norgay reached the summit of Everest.', category: 'FROM THE ARCHIVES', author: 'The Leaders History Desk', data: { ...blankHistoryData('flashback'), year: '1953', dateLabel: '29 MAY', subject: 'Everest summit', role: 'Edmund Hillary · Tenzing Norgay', place: 'Sagarmatha', fact: 'Hillary and Norgay reached the summit together during the 1953 British Everest expedition.', sample: true } },
        { template: 'discovery', headline: 'PENICILLIN, OBSERVED', summary: 'A mould on a forgotten petri dish opened the age of antibiotics.', category: 'DISCOVERY & SCIENCE', author: 'The Leaders History Desk', data: { ...blankHistoryData('discovery'), year: '1928', dateLabel: 'SEPTEMBER', subject: 'Alexander Fleming', role: 'Bacteriologist · St Mary’s Hospital', place: 'London', fact: 'Fleming noticed that a Penicillium mould killed the bacteria around it, naming the active substance penicillin.', sample: true } },
    ],
    ne: [
        { template: 'on-this-day', headline: 'सुगौली सन्धि अनुमोदन', summary: 'अङ्ग्रेज–नेपाल युद्धपछि सन् १८१६ मा सुगौली सन्धि अनुमोदन भयो।', category: 'आजको दिनमा', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('on-this-day'), language: 'ne', year: '1816', dateLabel: '४ मार्च', subject: 'सुगौली सन्धि', role: 'अङ्ग्रेजी-नेपाल युद्ध', place: 'सुगौली · कुमाऊँ', fact: 'यस सन्धिले युद्ध अन्त्य गर्‍यो र नेपालको पश्चिमी सीमा काली नदीमा तोक्यो।', sample: true } },
        { template: 'movement', headline: 'जन आन्दोलन पहिलो', summary: 'पञ्चायत प्रणाली उखेल्ने जनआन्दोलनले बहुदलीय राजनीतिको ढोका खोल्यो।', category: 'आन्दोलन', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('movement'), language: 'ne', year: '1990', dateLabel: 'अप्रिल', subject: 'जन आन्दोलन पहिलो', role: 'बहुदलीय शासनको माग', place: 'नेपाल', fact: 'हप्तौंको हड्तार र सडक आन्दोलनले पञ्चायत प्रणाली अन्त्य गर्‍यो।', sample: true } },
        { template: 'proclamation', headline: 'नेपाल गणतन्त्र घोषणा', summary: 'लोकसभाले २४० वर्ष पुरानो राजतन्त्र एउटै बैठकमा उठाइदियो।', category: 'ऐन जारी', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('proclamation'), language: 'ne', year: '2008', dateLabel: '२८ मे', subject: 'राजतन्त्रको अन्त्य', role: 'संविधान सभा घोषणा', place: 'सिंहदरबार, काठमाडौं', fact: 'संविधान सभाको पहिलो बैठकले शाह वंशलाई हटाएर नेपाललाई संघीय गणतन्त्र घोषणा गर्‍यो।', sample: true } },
        { template: 'first', headline: 'सगरमाथाको पहिलो सफल आरोहण', summary: '२९ मे १९५३ मा एडमन्ड हिलारी र तेन्जिङ नोर्गे सगरमाथाको चुचुरोमा पुगे।', category: 'पहिलो पटक', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('first'), language: 'ne', year: '1953', dateLabel: '२९ मे', subject: 'हिलारी र तेन्जिङको आरोहण', role: 'सगरमाथाको पहिलो सफल आरोहण', fact: 'सन् १९५३ को बेलायती अभियानमा दुवै आरोही विश्वको सर्वोच्च शिखरमा पुग्न सफल भए।', sample: true } },
        { template: 'cultural', headline: 'रवीन्द्रनाथ ठाकुरको नोबेल', summary: 'ठाकुर युरोपेली बाहेक साहित्यका नोबेल पुरस्कार पाउने पहिलो व्यक्ति बने।', category: 'संस्कृति र विचार', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('cultural'), language: 'ne', year: '1913', dateLabel: 'नोभेम्बर', subject: 'रवीन्द्रनाथ ठाकुर', role: 'साहित्यमा नोबेल पुरस्कार', fact: 'गीताञ्जलि र यसको अंग्रेजी अनुवादले ठाकुरलाई १९१३ को नोबेल दिलायो।', sample: true } },
        { template: 'born', headline: 'नेल्सन म्यान्डेलाको जन्म', summary: 'म्वेजोमा जन्मेका म्यान्डेला २७ वर्ष कैदपछि लोकतान्त्रिक दक्षिण अफ्रिकाका नेता बने।', category: 'आजको दिन जन्मिएका', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('born'), language: 'ne', year: '1918', dateLabel: '१८ जुलाई', subject: 'नेल्सन म्यान्डेला', role: 'रङ्गभेदविरोधी नेता · दक्षिण अफ्रिका', lifespan: '१९१८ – २०१३', place: 'म्वेजो, दक्षिण अफ्रिका', fact: '२७ वर्ष कैदपछि बाहिर आएर उनी १९९४ मा दक्षिण अफ्रिकाका पहिलो अश्वेत राष्ट्रपति बने।', sample: true } },
        { template: 'died', headline: 'स्मरणमा: मदर टेरेसा', summary: 'कोलकातामा मिशनरीज अफ च्यारिटी स्थापना गर्ने मदर टेरेसाको निधन भयो।', category: 'स्मरणमा', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('died'), language: 'ne', year: '1997', dateLabel: '५ सेप्टेम्बर', subject: 'मदर टेरेसा', role: 'मिशनरी · मिशनरीज अफ च्यारिटीका संस्थापक', lifespan: '१९१० – १९९७', place: 'कोलकाता, भारत', fact: 'उनले १९७९ मा शान्तिको नोबेल पाएकी थिइन् र २०१६ मा सन्त घोषणा भइन्।', sample: true } },
        { template: 'treaty', headline: 'अङ्ग्रेजी-नेपाल युद्धको अन्त्य', summary: 'सुगौलीमा स्वाक्षरी भएको सन्धिले हिमालका पहाडहरूको सीमा फेरिदियो।', category: 'सन्धि र सम्झौता', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('treaty'), language: 'ne', year: '1816', dateLabel: '४ मार्च १८१६', subject: 'सुगौली सन्धि', place: 'सुगौली · कुमाऊँ', fact: 'नेपालले कुमाऊँ र गढवाल त्यागेर काठमाडौंमा ब्रिटिश प्रतिनिधि राख्न सहमति जनायो।', sample: true } },
        { template: 'flashback', headline: 'अभिलेखबाट: २९ मे १९५३', summary: 'एडमन्ड हिलारी र तेन्जिङ नोर्गे सगरमाथाको चुचुरोमा पुगे।', category: 'अभिलेखबाट', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('flashback'), language: 'ne', year: '1953', dateLabel: '२९ मे', subject: 'सगरमाथा चुचुरो', role: 'एडमन्ड हिलारी · तेन्जिङ नोर्गे', place: 'सगरमाथा', fact: 'सन् १९५३ को बेलायती आरोहण अभियानमा हिलारी र नोर्गे एकसाथ चुचुरोमा पुगे।', sample: true } },
        { template: 'discovery', headline: 'पेनिसिलिन देखियो', summary: 'बिर्सिएको पेट्री डिशमा उम्रेको ढुसीले एन्टिबायोटिकको युग सुरु गर्‍यो।', category: 'आविष्कार र विज्ञान', author: 'द लिडर्स इतिहास डेस्क', data: { ...blankHistoryData('discovery'), language: 'ne', year: '1928', dateLabel: 'सेप्टेम्बर', subject: 'अलेक्जान्डर फ्लेमिङ', role: 'रोगाणुविज्ञानी · सेन्ट मेरीज हस्पिटल', place: 'लन्डन', fact: 'फ्लेमिङले पेनिसिलियम ढुसीले जीवाणु मार्ने देखेर त्यसको नाम पेनिसिलिन राखे।', sample: true } },
    ],
};

export const historySampleFor = (template: HistoryTemplateId, language: HistoryLanguage): HistorySample =>
    historySamples[language].find(sample => sample.template === template) ?? historySamples[language][0];

/** Desk strings that swap with the event language. */
export const historyEyebrow = (language: HistoryLanguage) => language === 'ne' ? 'द लिडर्स · इतिहास' : 'THE LEADERS / HISTORY DESK';
export const historyAuthor = (language: HistoryLanguage) => language === 'ne' ? 'द लिडर्स इतिहास डेस्क' : 'The Leaders History Desk';

/** Preview builds a sample-filled design; drafts keep empty event fields. */
export function createHistoryDesign(templateId: HistoryTemplateId, format: PostFormat = 'portrait', language: HistoryLanguage = 'en'): PostDesign {
    const sample = historySampleFor(templateId, language);
    return {
        ...structuredClone(defaultPostDesign), template: 'history', format,
        history: { ...sample.data, template: templateId, language },
        category: historyStamp(templateId, language), eyebrow: historyEyebrow(language),
        headline: sample.headline, summary: sample.summary, author: historyAuthor(language),
        accent: '#B71C1C', backgroundColor: '#F4EDE0', imageTone: 'warm', textAlign: 'left',
    };
}

/** Production drafts retain the chosen composition with empty event data. */
export function createHistoryDraftDesign(templateId: HistoryTemplateId, format: PostFormat = 'portrait', language: HistoryLanguage = 'en'): PostDesign {
    const preview = createHistoryDesign(templateId, format, language);
    return { ...preview, headline: language === 'ne' ? historyTemplate(templateId).headlineNe : historyTemplate(templateId).headline, summary: '', history: { ...blankHistoryData(templateId), language } };
}

/** Copy ceilings used by the prompt contract, the inspector counters and the text panel. */
export const historyCopy = { headline: 64, summary: 160 } as const;

/** Required event facts for the current template. The artwork publishes these as its export error. */
export function historyIssues(design: PostDesign): string[] {
    if (design.template !== 'history') return [];
    const data = design.history ?? blankHistoryData(), issues: string[] = [];
    if (data.pageKind === 'paragraph') {
        if (!design.headline.trim()) issues.push('Add a paragraph heading before exporting.');
        if (!data.body.trim()) issues.push('Add paragraph text before exporting.');
        if (design.hiddenLayers.includes('supporting')) issues.push('Show the paragraph text before exporting.');
        if (design.hiddenLayers.includes('headline')) issues.push('Show the heading before exporting.');
        if (design.headline.length > historyCopy.headline) issues.push(`Heading must be ${historyCopy.headline} characters or fewer.`);
        return issues;
    }
    if (!data.year.trim()) issues.push('Add the year before exporting.');
    if (!data.dateLabel.trim()) issues.push('Add the event date before exporting.');
    if (!design.headline.trim()) issues.push('Add the event headline before exporting.');
    if (!data.subject.trim()) issues.push('Add the subject before exporting.');
    if (!data.fact.trim() && !design.summary.trim()) issues.push('Add the fact before exporting.');
    if (design.hiddenLayers.includes('headline')) issues.push('Show the headline before exporting.');
    if (design.headline.length > historyCopy.headline) issues.push(`Headline must be ${historyCopy.headline} characters or fewer.`);
    if (design.summary.length > historyCopy.summary) issues.push(`Summary must be ${historyCopy.summary} characters or fewer.`);
    return issues;
}

/** Continuations share the event identity and design, with room for readable prose. */
export function createHistoryParagraphDesign(cover: PostDesign, body = '', heading?: string): PostDesign {
    const data = cover.history ?? blankHistoryData();
    return { ...structuredClone(cover), imageUri: null, placedImages: [],
        headline: heading ?? (data.language === 'ne' ? 'घटनाको विस्तृत विवरण' : 'The story'), summary: '',
        history: { ...data, template: 'on-this-day', pageKind: 'paragraph', body, fact: '', sample: false },
    };
}
