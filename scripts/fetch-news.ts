import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import slugify from 'slugify';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env.local file if present
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define your target RSS feeds
const RSS_FEEDS = [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
];

const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
    console.error('CRITICAL: MONGODB_URI is missing. Cannot fetch news.');
    process.exit(1);
}

// Minimal Mongoose Schema to write to the same collection Next.js uses
const articleSchema = new mongoose.Schema({
    title: { en: String, ne: String },
    content: { en: String, ne: String },
    excerpt: { en: String, ne: String },
    author: { en: String, ne: String },
    category: { en: String, ne: String },
    slug: { type: String, unique: true },
    image: String,
    tags: [String],
    status: String,
    publishedDate: Date
}, { strict: false });

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

async function translateAndFormat(title: string, contentSnippet: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a premium journalist for "The Alpine Ledger". Take the following raw news article and rewrite it into a highly professional, objective, and premium format.
    
Raw Title: ${title}
Raw Content: ${contentSnippet}

Instructions:
1. "title_en": A premium, punchy English headline.
2. "title_ne": A precise, formal Nepali translation of the headline.
3. "excerpt_en": A single sentence English summary.
4. "excerpt_ne": A single sentence Nepali summary.
5. "content_en": A well-written, 2-3 paragraph professional article in English based on the facts.
6. "content_ne": The professional Nepali translation of the article.
7. "category_en": The core category (e.g., World, Tech, Business).
8. "category_ne": Nepali translation of the category (e.g., विश्व, प्रविधि, व्यापार).

Format the output strictly as a valid JSON object. No markdown wrapping. Just the JSON.

{
    "title_en": "...",
    "title_ne": "...",
    "excerpt_en": "...",
    "excerpt_ne": "...",
    "content_en": "...",
    "content_ne": "...",
    "category_en": "...",
    "category_ne": "..."
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse AI response as JSON');
    }
    return JSON.parse(jsonMatch[0]);
}

async function main() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Starting automated premium news fetch...');

    for (const feedUrl of RSS_FEEDS) {
        try {
            const feed = await parser.parseURL(feedUrl);
            console.log(`\nProcessing feed: ${feed.title}`);

            for (const item of feed.items.slice(0, 3)) {
                if (!item.title) continue;

                // Create a slug from the original title
                const baseSlug = slugify(item.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
                const slug = `${baseSlug}-${new Date().toISOString().slice(0, 10)}`;

                const existing = await Article.findOne({ slug });
                if (existing) {
                    console.log(`[SKIP] Already exists: ${item.title}`);
                    continue;
                }

                console.log(`[AI] Processing: ${item.title}`);
                try {
                    const aiResult = await translateAndFormat(item.title, item.contentSnippet || item.content || '');
                    
                    const newArticle = new Article({
                        title: { en: aiResult.title_en, ne: aiResult.title_ne },
                        excerpt: { en: aiResult.excerpt_en, ne: aiResult.excerpt_ne },
                        content: { en: aiResult.content_en, ne: aiResult.content_ne },
                        category: { en: aiResult.category_en, ne: aiResult.category_ne },
                        author: { en: "Automated Desk", ne: "स्वचालित डेस्क" },
                        slug,
                        image: "/images/placeholders/news-placeholder.jpg",
                        status: "published",
                        publishedDate: new Date(item.pubDate || new Date())
                    });

                    await newArticle.save();
                    console.log(`[SUCCESS] Saved bilingual article: ${aiResult.title_en}`);

                } catch (aiError) {
                    console.error(`[ERROR] AI Translation failed for ${item.title}`, aiError);
                }
            }
        } catch (error) {
            console.error(`[ERROR] Processing feed ${feedUrl}:`, error);
        }
    }

    console.log('Automation run complete. Disconnecting...');
    await mongoose.disconnect();
}

main().catch(console.error);
