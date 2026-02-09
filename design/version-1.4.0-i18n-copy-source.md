# v1.4.0 – Nepali Copy Source

This document collects **all English static copy** that should have Nepali equivalents for the public site.  
Please fill in the `ne` fields for each item, keeping tone and context in mind (not literal word‑for‑word translation).

The format is lightweight JSON‑ish blocks so it’s easy to copy back into the codebase.

---

## 1. About Page – `src/app/about/page.tsx`

```txt
about.hero.label
en: "About"
ne:

about.hero.logoText
en: "THE LEADERS"
ne:

about.hero.tagline
en: "Truth, Unfiltered."
ne:

about.hero.paragraph
en: "A digital vault for the curious, the skeptical, and the visionary. The definitive archive where the past is preserved, the present is debated, and the future is informed."
ne:

about.welcome.heading
en: "Welcome to The Leaders."
ne:

about.welcome.subheading
en: "An experimental, independent political archive built in and for Nepal."
ne:

about.welcome.p1
en: "We’re not a news channel, a political party, or a think tank. We’re an archive—a living one. We collect, organise, and present information so citizens can form their own opinions."
ne:

about.welcome.p2
en: "Every page, dataset, or story you see here is designed to help you understand power: who holds it, how it’s used, and what it has cost us as a nation."
ne:

about.values.sectionHeading
en: "What We Believe"
ne:
```

**Values list (`VALUES` constant):**

```txt
about.values[0].title
en: "Truth is Our North Star"
ne:

about.values[0].description
en: "We believe in the facts. We stick to the laws. We don't cut corners, and we don't sugarcoat. Absolute integrity is our foundation."
ne:

about.values[1].title
en: "Expression Without Imposition"
ne:

about.values[1].description
en: "We have thoughts—plenty of them. We express them boldly, but we never demand agreement. Every archive entry is an invitation to conversation."
ne:

about.values[2].title
en: "The Archive of Interest"
ne:

about.values[2].description
en: "A curated repository for political discourse and historical significance. We host the 'right' information to foster informed democratic participation."
ne:

about.values[3].title
en: "Forged in Debate"
ne:

about.values[3].description
en: "The best ideas emerge from friction. We believe every data point is a starting point for dialogue, not a decree."
ne:
```

**Differentiators (`DIFFERENTIATORS` constant):**

```txt
about.differentiators.heading
en: "Why We Stand Out"
ne:

about.differentiators.subheading
en: "We've mastered the art of being serious about information while staying playful and engaging in its delivery."
ne:

about.differentiators[0].title
en: "Grand Central Station for Political Information"
ne:

about.differentiators[0].description
en: "A central hub where the past is archived, the present is debated, and the future is informed. We're the definitive digital archive for those who value depth and history."
ne:

about.differentiators[1].title
en: "Clean & Uniform"
ne:

about.differentiators[1].description
en: "We cut through digital noise with a minimalist, 'Newspaper' aesthetic that lets the content breathe. Clarity over clutter, always."
ne:

about.differentiators[2].title
en: "Meaningful Motion"
ne:

about.differentiators[2].description
en: "Smooth animations and transitions that make exploring complex political landscapes feel as fluid as a conversation. Form follows function."
ne:

about.differentiators[3].title
en: "Confidential by Nature"
ne:

about.differentiators[3].description
en: "We keep internal operations quiet to protect independence. By maintaining professional distance, we keep focus entirely on the data and dialogue."
ne:
```

**Commitment & CTA:**

```txt
about.commitment.heading
en: "Our Commitment"
ne:

about.commitment.p1
en: "We remain dedicated to maintaining this platform as a transparent, credible, and accessible resource for all citizens interested in Nepal's political journey."
ne:

about.commitment.p2
en: "While we keep certain operational details confidential to protect our independence, our content and methodologies are always open to scrutiny and feedback."
ne:

about.commitment.p3
en: "We exist to preserve history, document the present, and provide the tools for true civic engagement."
ne:

about.commitment.tagline
en: "Truth. Transparency. Democracy."
ne:

about.cta.heading
en: "Lead the Conversation.\nJoin the Archive."
ne:

about.cta.body
en: "Dive into our comprehensive archive of leaders, election data, and political insights."
ne:

about.cta.buttonLeaders
en: "Discover Leaders"
ne:

about.cta.buttonElection
en: "Explore Election Data"
ne:
```

---

## 2. History Page – `src/app/history/page.tsx`

```txt
history.hero.label
en: "The Archives"
ne:

history.hero.heading
en: "Timeline of Chaos"
ne:

history.hero.subheading
en: "From the blood of Kot to the birth of a Republic. The history of Nepal is written in fire."
ne:
```

_(Timeline component texts are handled separately and already partially localized.)_

---

## 3. Articles Landing – `src/app/articles/page.tsx`

```txt
articles.metadata.title
en: "Articles"
ne:

articles.metadata.description
en: "Read the latest news and perspectives from The Leaders of Nepal."
ne:

articles.heading
en: "News & Perspectives"
ne:

articles.subheading
en: "Explore the archives of thought, analysis, and history."
ne:

articles.empty.title
en: "Unable to load articles at this time."
ne:

articles.empty.subtitle
en: "Please check your connection code or try again later."
ne:
```

---

## 4. Election 2026 Landing – `src/app/election-2026/page.tsx`

```txt
election2026.metadata.title
en: "Nepal Election 2026"
ne:

election2026.metadata.description
en: "Track Nepal's 2026 election results, analyze political trends, view district-wise data, and stay updated with real-time election analytics and insights."
ne:

election2026.loadingText
en: "Loading Election Data..."
ne:
```

_(Most of the rich copy for Election 2026 lives inside `AnalyticsDashboard` and election cards; those will be extracted in a separate pass once schemas are fully bilingual.)_

---

## 5. Legal Pages – `src/app/privacy-policy/page.tsx`

```txt
privacy.hero.label
en: "Legal"
ne:

privacy.hero.heading
en: "Privacy Policy"
ne:

privacy.hero.updated
en: "Last Updated: January 31, 2026"
ne:

privacy.section1.heading
en: "1. Introduction"
ne:

privacy.section1.body
en: "At \"The Leaders\", we respect your privacy and are committed to protecting the personal data we hold about you. This policy explains how we collect, use, and safeguard your information when you visit our website."
ne:

privacy.section2.heading
en: "2. Information We Collect"
ne:

privacy.section2.body
en: "We may collect the following types of information:"
ne:

privacy.section2.item1
en: "Usage Data: Information about your device, browser, and how you interact with our site (pages visited, time spent, etc.)."
ne:

privacy.section2.item2
en: "Communications: If you contact us via email, we keep a record of that correspondence."
ne:

privacy.section2.item3
en: "Cookies: We use cookies to enhance your browsing experience (see our Cookie Policy)."
ne:

privacy.section3.heading
en: "3. How We Use Your Data"
ne:

privacy.section3.body
en: "We use your data to:"
ne:

privacy.section3.list1
en: "Provide and improve the Platform's functionality."
ne:

privacy.section3.list2
en: "Analyze usage trends to enhance user experience."
ne:

privacy.section3.list3
en: "Respond to your inquiries or support requests."
ne:

privacy.section3.list4
en: "Ensure the security of our services."
ne:

privacy.section4.heading
en: "4. Data Sharing"
ne:

privacy.section4.body
en: "We do not sell your personal data. We may share data with trusted third-party service providers (e.g., analytics providers, hosting services) who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential."
ne:

privacy.section5.heading
en: "5. Your Rights"
ne:

privacy.section5.body
en: "Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete the data we hold about you. To exercise these rights, please contact us."
ne:

privacy.footer.note
en: "For any privacy-related questions, please contact us at privacy@theleaders.np."
ne:
```

_(Similar structures can be followed for Terms and Cookie Policy if you’d like full Nepali legal text later.)_

---

## 6. Accessibility – `src/app/accessibility/page.tsx`

```txt
accessibility.hero.label
en: "Statement"
ne:

accessibility.hero.heading
en: "Accessibility"
ne:

accessibility.hero.subheading
en: "Commitment to Digital Inclusion"
ne:

accessibility.commitment.heading
en: "Our Commitment"
ne:

accessibility.commitment.body
en: "\"The Leaders\" is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards."
ne:
```

**Feature grid:**

```txt
accessibility.features[0].title
en: "Visual Clarity"
ne:

accessibility.features[0].description
en: "High contrast modes, scalable text, and clear typography ensure readability for all users."
ne:

accessibility.features[1].title
en: "Keyboard Navigation"
ne:

accessibility.features[1].description
en: "Full keyboard support for all interactive elements, ensuring a mouse-free experience."
ne:

accessibility.features[2].title
en: "Responsive Design"
ne:

accessibility.features[2].description
en: "Seamless experience across all devices, screens, and orientations."
ne:

accessibility.features[3].title
en: "Semantic Structure"
ne:

accessibility.features[3].description
en: "Proper HTML5 landmarks and heading hierarchy for screen reader efficiency."
ne:
```

---

This should be enough to start high‑quality Nepali copy for the most important static pages.  
Once you fill in the `ne` fields, I’ll wire them back into the components and hook them up to the global language switch. 

