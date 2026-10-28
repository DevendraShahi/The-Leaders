/** Legacy IDs remain valid in saved drafts; the editor exposes one History design. */
export const historyTemplateIds = ['on-this-day', 'flashback', 'born', 'died', 'treaty', 'movement', 'proclamation', 'first', 'cultural', 'discovery'] as const;
export type HistoryTemplateId = typeof historyTemplateIds[number];
export type HistoryLanguage = 'en' | 'ne';
export type HistoryLayout = 'year';
export type HistoryCategory = 'Today in History';
export const historyCategories: HistoryCategory[] = ['Today in History'];
export const historyTemplates = [{ id: 'on-this-day' as HistoryTemplateId, title: 'Today in History', titleNe: 'इतिहासमा आजको दिन', category: 'Today in History' as HistoryCategory, layout: 'year' as HistoryLayout,
    headline: 'TODAY IN HISTORY', headlineNe: 'इतिहासमा आजको दिन', description: 'One cover, followed by paragraph pages only when the story needs them.', descriptionNe: 'एउटा मुख्य पृष्ठ र आवश्यकताअनुसार थप विवरणका पृष्ठहरू।' }];
export const historyTemplate = (_id: HistoryTemplateId) => historyTemplates[0];
export const historyLayout = (_id: HistoryTemplateId): HistoryLayout => 'year';
export const historyCategory = (_id: HistoryTemplateId): HistoryCategory => 'Today in History';
export const historyTemplateOptionGroups = [{ label: 'History', items: [{ id: 'on-this-day' as HistoryTemplateId, title: 'Today in History' }] }];
export type HistoryFieldId = 'year' | 'dateLabel' | 'subject' | 'role' | 'era' | 'place' | 'lifespan' | 'fact' | 'body';
export const historyFieldLabels: Record<HistoryFieldId, string> = { year: 'Event year', dateLabel: 'Event date', subject: 'Subject', role: 'Role or description', era: 'Era or period', place: 'Place', lifespan: 'Lifespan', fact: 'Cover context', body: 'Paragraph text' };
export const historyPromptFields = Object.fromEntries(historyTemplateIds.map(id => [id, ['year', 'dateLabel', 'subject', 'fact']])) as unknown as Record<HistoryTemplateId, readonly HistoryFieldId[]>;
export const historyStamp = (_id: HistoryTemplateId, language: HistoryLanguage) => language === 'ne' ? 'इतिहासमा आजको दिन' : 'TODAY IN HISTORY';
