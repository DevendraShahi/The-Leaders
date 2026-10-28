export const researchRegions = [{ id: 'auto', label: 'Choose for me' }, { id: 'nepal', label: 'Nepal' }, { id: 'world', label: 'International' }] as const;
export const researchTopics = [{ id: 'auto', label: 'Choose for me' }, { id: 'science', label: 'Science' }, { id: 'history', label: 'History' }, { id: 'culture', label: 'Culture' }, { id: 'nature', label: 'Nature' }, { id: 'society', label: 'Society & public affairs' }] as const;
export type ResearchScope = { region: typeof researchRegions[number]['id']; topic: typeof researchTopics[number]['id'] };
export function researchInstructions(scope?: ResearchScope): string {
    const region = scope?.region === 'nepal' ? 'Research Nepal-related subjects only.' : scope?.region === 'world' ? 'Research international subjects outside Nepal.' : 'Choose a relevant subject from Nepal or the wider world.';
    const topic = researchTopics.find(topic => topic.id === scope?.topic);
    return `${region} ${topic && topic.id !== 'auto' ? `Focus on ${topic.label}.` : 'Choose the topic yourself when none is requested.'}`;
}
