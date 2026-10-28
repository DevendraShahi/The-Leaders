import type { NplTeamId } from './post-studio/cricket-catalog';

export interface BatterScore {
  name: string;
  nameNe: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  dismissal: string;
  dismissalNe: string;
  isNotOut?: boolean;
}

export interface BowlerScore {
  name: string;
  nameNe: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
}

export interface FallOfWicket {
  score: string;
  player: string;
  over: string;
}

export interface InningsScorecard {
  teamId: NplTeamId;
  teamName: string;
  teamNameNe: string;
  score: string;
  overs: string;
  runRate: string;
  extras: {
    total: number;
    w: number;
    nb: number;
    lb: number;
    b: number;
  };
  batting: BatterScore[];
  bowling: BowlerScore[];
  fow: FallOfWicket[];
}

export interface CompletedMatchScorecard {
  matchNumber: number;
  matchDate: string;
  venue: string;
  venueNe: string;
  toss: string;
  tossNe: string;
  result: string;
  resultNe: string;
  winnerId: NplTeamId;
  margin: string;
  playerOfTheMatch: {
    name: string;
    nameNe: string;
    teamId: NplTeamId;
    performance: string;
    performanceNe: string;
    image?: string;
  };
  innings1: InningsScorecard;
  innings2: InningsScorecard;
}

export const nplMatch1Scorecard: CompletedMatchScorecard = {
  matchNumber: 1,
  matchDate: "2026-10-26",
  venue: "Tribhuvan University International Cricket Ground, Kirtipur",
  venueNe: "त्रिभुवन विश्वविद्यालय अन्तर्राष्ट्रिय क्रिकेट मैदान, कीर्तिपुर",
  toss: "Lumbini Lions won the toss and elected to field",
  tossNe: "लुम्बिनी लायन्सले टस जितेर फिल्डिङ रोज्यो",
  result: "Lumbini Lions won by 7 wickets (with 61 balls remaining)",
  resultNe: "लुम्बिनी लायन्स ७ विकेटले विजयी (६१ बल बाँकी छँदै)",
  winnerId: "lumbini",
  margin: "7 wickets (61 balls to spare)",
  playerOfTheMatch: {
    name: "Sher Malla",
    nameNe: "शेर मल्ल",
    teamId: "lumbini",
    performance: "3/11 (4.0 overs, Econ 2.75)",
    performanceNe: "३/११ (४.० ओभर, इकोनोमी २.७५)",
    image: "/studio/cricket/players/sher-malla.webp"
  },
  innings1: {
    teamId: "sudurpaschim",
    teamName: "Sudurpaschim Royals",
    teamNameNe: "सुदूरपश्चिम रोयल्स",
    score: "87",
    overs: "17.2",
    runRate: "5.02",
    extras: { total: 10, w: 3, nb: 0, lb: 7, b: 0 },
    batting: [
      { name: "Binod Bhandari", nameNe: "विनोद भण्डारी", runs: 9, balls: 8, fours: 1, sixes: 0, strikeRate: "112.50", dismissal: "lbw b Sher Malla", dismissalNe: "एलबीडब्लू शेर मल्ल" },
      { name: "Saif Zaib", nameNe: "सैफ जैब", runs: 13, balls: 14, fours: 2, sixes: 0, strikeRate: "92.85", dismissal: "c & b Shadley van Schalkwyk", dismissalNe: "कट एन्ड बोल्ड भ्यान शाल्कविक" },
      { name: "Aarif Sheikh", nameNe: "आरिफ शेख", runs: 0, balls: 6, fours: 0, sixes: 0, strikeRate: "0.00", dismissal: "c & b Kishore Mahato", dismissalNe: "कट एन्ड बोल्ड किशोर महतो" },
      { name: "Brandon McMullen", nameNe: "ब्रान्डन म्याकमुलन", runs: 2, balls: 2, fours: 0, sixes: 0, strikeRate: "100.00", dismissal: "c & b Kishore Mahato", dismissalNe: "कट एन्ड बोल्ड किशोर महतो" },
      { name: "Dipendra Singh Airee (C)", nameNe: "दिपेन्द्र सिंह ऐरी (क)", runs: 27, balls: 23, fours: 2, sixes: 0, strikeRate: "117.39", dismissal: "b Kishore Mahato", dismissalNe: "बोल्ड किशोर महतो" },
      { name: "Ishan Pandey", nameNe: "इशान पाण्डे", runs: 7, balls: 9, fours: 0, sixes: 0, strikeRate: "77.77", dismissal: "b Tilak Bhandari", dismissalNe: "बोल्ड तिलक भण्डारी" },
      { name: "Sherfane Rutherford", nameNe: "शेरफेन रदरफोर्ड", runs: 1, balls: 4, fours: 0, sixes: 0, strikeRate: "25.00", dismissal: "c D'Arcy Short b Sher Malla", dismissalNe: "क्याच सर्ट बोल्ड शेर मल्ल" },
      { name: "Scott Kuggeleijn", nameNe: "स्कट कुगेलिन", runs: 0, balls: 2, fours: 0, sixes: 0, strikeRate: "0.00", dismissal: "lbw b Sher Malla", dismissalNe: "एलबीडब्लू शेर मल्ल" },
      { name: "Anil Kharel", nameNe: "अनिल खरेल", runs: 15, balls: 19, fours: 1, sixes: 0, strikeRate: "78.94", dismissal: "not out", dismissalNe: "नटआउट", isNotOut: true },
      { name: "Hemant Dhami", nameNe: "हेमन्त धामी", runs: 0, balls: 1, fours: 0, sixes: 0, strikeRate: "0.00", dismissal: "b Kishore Mahato", dismissalNe: "बोल्ड किशोर महतो" },
      { name: "Abhinash Bohara", nameNe: "अविनाश बोहरा", runs: 3, balls: 9, fours: 0, sixes: 0, strikeRate: "33.33", dismissal: "b Rohit Paudel", dismissalNe: "बोल्ड रोहित पौडेल" }
    ],
    bowling: [
      { name: "Kishore Mahato", nameNe: "किशोर महतो", overs: "4.0", maidens: 0, runs: 22, wickets: 4, economy: "5.50" },
      { name: "Sher Malla", nameNe: "शेर मल्ल", overs: "4.0", maidens: 0, runs: 11, wickets: 3, economy: "2.75" },
      { name: "Shadley van Schalkwyk", nameNe: "शादली भ्यान शाल्कविक", overs: "3.0", maidens: 0, runs: 19, wickets: 1, economy: "6.33" },
      { name: "Tilak Bhandari", nameNe: "तिलक भण्डारी", overs: "4.0", maidens: 0, runs: 18, wickets: 1, economy: "4.50" },
      { name: "Rohit Kumar Paudel", nameNe: "रोहित कुमार पौडेल", overs: "2.2", maidens: 0, runs: 10, wickets: 1, economy: "4.29" }
    ],
    fow: [
      { score: "24-1", player: "Binod Bhandari", over: "3.1" },
      { score: "26-2", player: "Aarif Sheikh", over: "4.2" },
      { score: "28-3", player: "Brandon McMullen", over: "4.4" },
      { score: "34-4", player: "Saif Zaib", over: "5.4" },
      { score: "53-5", player: "Ishan Pandey", over: "8.2" },
      { score: "56-6", player: "Sherfane Rutherford", over: "9.2" },
      { score: "56-7", player: "Scott Kuggeleijn", over: "9.4" },
      { score: "70-8", player: "Dipendra Singh Airee", over: "12.3" },
      { score: "70-9", player: "Hemant Dhami", over: "12.4" },
      { score: "87-10", player: "Abhinash Bohara", over: "17.2" }
    ]
  },
  innings2: {
    teamId: "lumbini",
    teamName: "Lumbini Lions",
    teamNameNe: "लुम्बिनी लायन्स",
    score: "88/3",
    overs: "9.5",
    runRate: "8.95",
    extras: { total: 3, w: 3, nb: 0, lb: 0, b: 0 },
    batting: [
      { name: "D'Arcy Short", nameNe: "डार्सी सर्ट", runs: 40, balls: 18, fours: 4, sixes: 3, strikeRate: "222.22", dismissal: "c Sherfane Rutherford b Anil Kharel", dismissalNe: "क्याच रदरफोर्ड बोल्ड अनिल खरेल" },
      { name: "Aasif Sheikh", nameNe: "आसिफ शेख", runs: 32, balls: 25, fours: 2, sixes: 2, strikeRate: "128.00", dismissal: "st Binod Bhandari b Anil Kharel", dismissalNe: "स्टम्पिङ भण्डारी बोल्ड अनिल खरेल" },
      { name: "Niroshan Dickwella", nameNe: "निरोशन डिकवेला", runs: 7, balls: 10, fours: 0, sixes: 0, strikeRate: "70.00", dismissal: "b Dipendra Singh Airee", dismissalNe: "बोल्ड दिपेन्द्र सिंह ऐरी" },
      { name: "Rohit Paudel (C)", nameNe: "रोहित पौडेल (क)", runs: 5, balls: 3, fours: 1, sixes: 0, strikeRate: "166.66", dismissal: "not out", dismissalNe: "नटआउट", isNotOut: true },
      { name: "Shamim Hossain", nameNe: "शमिम हुसेन", runs: 1, balls: 3, fours: 0, sixes: 0, strikeRate: "33.33", dismissal: "not out", dismissalNe: "नटआउट", isNotOut: true }
    ],
    bowling: [
      { name: "Anil Kharel", nameNe: "अनिल खरेल", overs: "2.0", maidens: 0, runs: 28, wickets: 2, economy: "14.00" },
      { name: "Dipendra Singh Airee", nameNe: "दिपेन्द्र सिंह ऐरी", overs: "2.0", maidens: 0, runs: 14, wickets: 1, economy: "7.00" },
      { name: "Scott Kuggeleijn", nameNe: "स्कट कुगेलिन", overs: "2.0", maidens: 0, runs: 15, wickets: 0, economy: "7.50" },
      { name: "Abhinash Bohara", nameNe: "अविनाश बोहरा", overs: "2.0", maidens: 0, runs: 16, wickets: 0, economy: "8.00" },
      { name: "Saif Zaib", nameNe: "सैफ जैब", overs: "1.5", maidens: 0, runs: 15, wickets: 0, economy: "8.18" }
    ],
    // Withheld: the previous transcription contained impossible over 8.7.
    fow: []
  }
};

export const nplCompletedMatches: Record<number, CompletedMatchScorecard> = {
  1: nplMatch1Scorecard
};
