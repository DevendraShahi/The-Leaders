export type PostFormat = "square" | "portrait" | "story";
export type PostTemplate = "breaking" | "explainer" | "quote";
export type TextAlignment = "left" | "center";
export type ImageTone = "ink" | "clear" | "warm";
export type PostLayer = "visual" | "kicker" | "headline" | "supporting" | "footer";

export type PostDesign = {
  template: PostTemplate;
  format: PostFormat;
  category: string;
  eyebrow: string;
  headline: string;
  summary: string;
  author: string;
  imageUri: string | null;
  accent: string;
  headlineScale: number;
  textAlign: TextAlignment;
  imageTone: ImageTone;
  imageOffsetX: number;
  imageOffsetY: number;
  hiddenLayers: PostLayer[];
  lockedLayers: PostLayer[];
};

export const defaultPostDesign: PostDesign = {
  template: "breaking",
  format: "square",
  category: "POLITICS",
  eyebrow: "DEVELOPING STORY",
  headline: "A clearer way to share the story that matters.",
  summary: "Give readers the useful context before they open the full report.",
  author: "The Leaders Desk",
  imageUri: null,
  accent: "#B71C1C",
  headlineScale: 1,
  textAlign: "left",
  imageTone: "ink",
  imageOffsetX: 0,
  imageOffsetY: 0,
  hiddenLayers: [],
  lockedLayers: [],
};

export const postTemplates: Array<{ key: PostTemplate; title: string; subtitle: string; patch: Partial<PostDesign> }> = [
  {
    key: "breaking",
    title: "Breaking",
    subtitle: "Fast & clear",
    patch: { category: "POLITICS", eyebrow: "DEVELOPING STORY", headline: "A clearer way to share the story that matters.", summary: "Give readers the useful context before they open the full report." },
  },
  {
    key: "explainer",
    title: "Explainer",
    subtitle: "Add context",
    patch: { category: "EXPLAINER", eyebrow: "WHAT YOU NEED TO KNOW", headline: "The five details behind today’s biggest decision.", summary: "A plain-language guide to the names, numbers, and next steps." },
  },
  {
    key: "quote",
    title: "Quote",
    subtitle: "Put voices forward",
    patch: { category: "VOICES", eyebrow: "IN THEIR WORDS", headline: "“The public deserves a conversation built on facts.”", summary: "A moment from today’s conversation, with the full context in the caption." },
  },
];
