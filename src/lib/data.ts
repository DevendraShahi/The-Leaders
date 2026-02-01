import dbConnect from "@/lib/db";
import Article, { IArticle } from "@/models/Article";
import { cache } from "react";
import { logger } from "@/lib/logger";

// Cache the result for request deduplication
export const getArticles = cache(async (limit: number = 3) => {
    try {
        await dbConnect();
        const articles = await Article.find({})
            .sort({ publishedDate: -1 })
            .limit(limit)
            .lean();

        // Serialize MongoDB objects (convert _id and dates to string if needed, 
        // but Next.js Server Components can handle Dates usually. 
        // _id needs to be string if passing to client components, but here we return lean objects).
        // To be safe for serialization across boundary if needed (though mostly server side):
        return JSON.parse(JSON.stringify(articles)) as IArticle[];
    } catch (error) {
        logger.error("Failed to fetch articles", { error, limit });
        return [];
    }
});

export const getArticleBySlug = cache(async (slug: string) => {
    try {
        await dbConnect();
        const article = await Article.findOne({ slug }).lean();
        if (!article) return null;
        return JSON.parse(JSON.stringify(article)) as IArticle;
    } catch (error) {
        logger.error("Failed to fetch article by slug", { error, slug });
        return null;
    }
});

