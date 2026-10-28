// Ported from mobile/src/features/post-designer; keep artwork behavior in sync.
import { brand } from "./tokens";
import { blankCricketData, type CricketData } from './cricket-data';
import { blankHistoryData, type HistoryData } from './history-data';
export type PostFormat = "square" | "portrait" | "story" | "landscape";
export type PostTemplate = "breaking" | "explainer" | "quote" | "book-review" | "book-analysis" | "book-takeaways" | "book-verdict" | "cricket" | "history";
export type TextAlignment = "left" | "center";
export type ImageTone = "ink" | "clear" | "warm";
export type CricketStyle = 'stadium' | 'editorial' | 'classic';
export const cricketStyles: { id: CricketStyle; label: string; description: string }[] = [
  { id: 'stadium', label: 'Stadium', description: 'Bold team crests, oversized numbers and a dark sports finish.' },
  { id: 'editorial', label: 'Editorial', description: 'Warm paper, clean rules and sharply ordered match information.' },
  { id: 'classic', label: 'Classic', description: 'The original cricket layouts.' },
];
export type PostLayer = "visual" | "kicker" | "headline" | "supporting" | "footer";
export type PostTextLayer = Exclude<PostLayer, "visual">;
export type TextPositions = Record<PostTextLayer, { x: number; y: number }>;
export const defaultTextPositions = (): TextPositions => ({ kicker: { x: 0, y: 0 }, headline: { x: 0, y: 0 }, supporting: { x: 0, y: 0 }, footer: { x: 0, y: 0 } });
export type TextTypography = { font: "auto" | "onest" | "hind"; size: number; lineSpacing: number; shadow: number };
export const defaultTextTypography = (): Record<PostTextLayer, TextTypography> => Object.fromEntries(["headline", "supporting", "kicker", "footer"].map(layer => [layer, { font: "auto", size: 100, lineSpacing: 100, shadow: 0 }])) as Record<PostTextLayer, TextTypography>;
export type TextColors = Record<PostTextLayer, string | null>;
export const defaultTextColors = (): TextColors => ({ kicker: null, headline: null, supporting: null, footer: null });

export const postOutputDimensions: Record<PostFormat, readonly [number, number]> = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  story: [1080, 1920],
  landscape: [1920, 1080],
};

export const postExportReferenceWidth = 360;

export type PlacedImagePlacement = 'custom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'split-left' | 'split-right';

export type PlacedImageLayer = 'back' | 'middle' | 'front';

export type PlacedImage = {
  id: string;
  uri: string;
  x: number;
  y: number;
  scale: number;
  rotation?: number;
  opacity?: number;
  borderRadius?: number;
  fit?: 'cover' | 'contain';
  width?: number;
  height?: number;
  placement?: PlacedImagePlacement;
  layer?: PlacedImageLayer;
  credit?: string;
  hidden?: boolean;
  locked?: boolean;
};

export type PostDesign = {
  template: PostTemplate;
  format: PostFormat;
  category: string;
  eyebrow: string;
  headline: string;
  summary: string;
  author: string;
  imageUri: string | null;
  imageCredit: string;
  accent: string;
  headlineScale: number;
  textAlign: TextAlignment;
  imageTone: ImageTone;
  imageOffsetX: number;
  imageOffsetY: number;
  imageZoom: number;
  imageFit: "cover" | "contain";
  imageBlur: number;
  imageVintage: number;
  imageFeather: number;
  hiddenLayers: PostLayer[];
  lockedLayers: PostLayer[];
  textPositions: TextPositions;
  textColors: TextColors;
  textTypography: Record<PostTextLayer, TextTypography>;
  backgroundColor?: string | null;
  backgroundGradient?: string | null;
  cricket?: CricketData;
  history?: HistoryData;
  contentLanguage?: 'en' | 'ne';
  researchTopic?: string;
  series?: { topic: string; issue: string };
  editorialReview?: import('./editorial').EditorialReview;
  newsStyle?: 'daily' | 'hot' | 'report' | 'do-you-know' | 'interesting-facts';
  echo11Variant?: number;
  placedImages?: PlacedImage[];
  sourceUrls?: string[];
  fixtureId?: string;
  cricketStyle?: CricketStyle;
  playerPhotoId?: string;
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
  imageCredit: '',
  accent: brand.red,
  headlineScale: 1,
  textAlign: "left",
  imageTone: "ink",
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageZoom: 1.08,
  imageFit: "cover",
  imageBlur: 0,
  imageVintage: 0,
  imageFeather: 0,
  hiddenLayers: [],
  lockedLayers: [],
  textPositions: defaultTextPositions(),
  textColors: defaultTextColors(),
  textTypography: defaultTextTypography(),
  backgroundColor: null,
  backgroundGradient: null,
  placedImages: [],
};

export const postTemplates: { key: PostTemplate; title: string; subtitle: string; patch: Partial<PostDesign> }[] = [
  { key: 'cricket', title: 'Cricket', subtitle: 'NPL match coverage', patch: { cricket: blankCricketData(), category: 'NPL 2026', headline: 'MATCHDAY', summary: '', eyebrow: 'THE LEADERS / CRICKET', author: 'The Leaders Sports', format: 'portrait', accent: '#F1C64C', backgroundColor: '#321C30' } },
  { key: 'history', title: 'Today in History', subtitle: 'इतिहासमा आजको दिन', patch: { history: blankHistoryData(), category: 'ON THIS DAY', headline: 'ON THIS DAY', summary: '', eyebrow: 'THE LEADERS / HISTORY DESK', author: 'The Leaders History Desk', format: 'portrait', accent: '#B71C1C', backgroundColor: '#F4EDE0' } },
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
  {
    key: "book-review",
    title: "Book Review",
    subtitle: "Overview & Thesis",
    patch: {
      category: "BOOK REVIEW · DEMOCRATIC THOUGHT",
      eyebrow: "B.P. KOIRALA · ★★★★★ 5.0",
      headline: "Jail Journal: The Conscience of Democracy",
      summary: "CENTRAL THESIS: True national sovereignty cannot exist without the democratic freedom of individual citizens. Surrendering rights to preserve a regime guarantees both domestic subjugation and foreign subservience.",
      author: "By B.P. Koirala · Review by The Leaders",
      accent: "#B71C1C",
      format: "portrait",
    },
  },
  {
    key: "book-analysis",
    title: "Deep Analysis",
    subtitle: "Arguments & Ideology",
    patch: {
      category: "ARGUMENT & EVIDENCE",
      eyebrow: "PURPOSE & IDEOLOGY",
      headline: "The Institutional Roots of Prosperity and Decay",
      summary: "PURPOSE: Dissect why cosmetic reforms fail under extractive monopolies.\n\nARGUMENT: Extractive political elites actively resist creative destruction to preserve elite cartels.",
      author: "The Leaders Book Review",
      accent: "#C5A059",
      format: "portrait",
    },
  },
  {
    key: "book-takeaways",
    title: "Key Takeaways",
    subtitle: "Relevance & Lessons",
    patch: {
      category: "RELEVANCE & APPLICATION",
      eyebrow: "LESSONS FOR NEPAL",
      headline: "Three Lessons for Nepal's Republic Today",
      summary: "1. Democratic vigilance is the only hedge against institutional decay.\n2. Inclusivity must precede stability.\n3. Moral conviction outlasts opportunistic coalitions.",
      author: "Ideas for Modern Governance",
      accent: "#1E3A8A",
      format: "portrait",
    },
  },
  {
    key: "book-verdict",
    title: "Critic Verdict",
    subtitle: "Why It Matters & Rating",
    patch: {
      category: "THE VERDICT · ★★★★★ 5.0",
      eyebrow: "CRITIC'S VERDICT",
      headline: "“A searing human testament to conscience over convenience.”",
      summary: "WHY IT MATTERS: In an era of political cynicism, it remains the ultimate ethical compass for leadership, statecraft, and civic dignity.",
      author: "The Leaders Editorial Board",
      accent: "#B71C1C",
      format: "portrait",
    },
  },
];
