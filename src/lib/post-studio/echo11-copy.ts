/** Approved bilingual pairs. Store only the index so changing language keeps the message. */
export const echo11Lines = [
    { ne: 'तपाईंको व्यवसायको वेबसाइट छैन? हामी बनाउँछौँ।', en: 'Need a website for your business? We can build it.', subtext: { ne: "आफ्नो प्रोजेक्टबारे छलफल गरौँ।", en: "Let's discuss your project." } },
    { ne: 'आफ्नो व्यवसायलाई अनलाइन लैजाने सोचमा हुनुहुन्छ?', en: 'Thinking of bringing your business online?', subtext: { ne: "वेबसाइटको लागतबारे जानकारी लिनुहोस्।", en: "Request a website quote." } },
    { ne: 'तपाईंको व्यवसायका लागि, तपाईंको आवश्यकता अनुसार वेबसाइट।', en: 'A website built around your business needs.', subtext: { ne: "आफ्नो व्यवसायको जानकारी हामीलाई पठाउनुहोस्।", en: "Tell us about your business." } },
    { ne: 'Facebook पेज मात्र छ? अब आफ्नै वेबसाइट पनि बनाउनुहोस्।', en: "Have a Facebook page? It's time for your own website, too.", subtext: { ne: "वेबसाइटको योजना बनाउन सुरु गरौँ।", en: "Let's start planning your website." } },
    { ne: 'वेबसाइट बनाउन चाहनुहुन्छ? हामीसँग कुरा गर्नुहोस्।', en: "Planning a website? Let's talk.", subtext: { ne: "तपाईंलाई चाहिने सुविधाबारे हामीलाई बताउनुहोस्।", en: "Tell us what features you need." } },
    { ne: 'सामान्य वेबसाइटदेखि अनलाइन स्टोरसम्म।', en: 'From business websites to online stores.', subtext: { ne: "वेबसाइट बनाउन तयार हुनुहुन्छ? सम्पर्क गर्नुहोस्।", en: "Ready to build your website? Get in touch." } },
    { ne: 'तपाईं व्यवसायमा ध्यान दिनुहोस्, वेबसाइट हामी बनाउँछौँ।', en: "Focus on your business. We'll take care of the website.", subtext: { ne: "Echo11 सँग आफ्नो वेबसाइटको काम सुरु गर्नुहोस्।", en: "Start your website project with Echo11." } },
    { ne: 'तपाईंको व्यवसाय, तपाईंको वेबसाइट।', en: 'Your business. Your website.', subtext: { ne: "केही सोध्न चाहनुहुन्छ? म्यासेज गर्नुहोस्।", en: "Have questions? Send us a message." } },
] as const;
export function randomEcho11Variant() { return Math.floor(Math.random() * echo11Lines.length); }
/** Old drafts get a stable choice from their content rather than changing on every render. */
export function echo11Variant(variant?: number, seed = '') {
    if (Number.isInteger(variant) && variant! >= 0 && variant! < echo11Lines.length) return variant!;
    let hash = 0;
    for (const char of seed) hash = (Math.imul(hash, 31) + char.codePointAt(0)!) >>> 0;
    return hash % echo11Lines.length;
}
