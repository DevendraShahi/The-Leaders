
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ElectionArticle } from '../src/models/ElectionContent';
import dbConnect from '../src/lib/db';

dotenv.config({ path: '.env.local' });

async function debug() {
    console.log('Connecting to DB...');
    await dbConnect();
    console.log('Connected.');

    const slug = 'analysis-logistics-final-mile';
    console.log(`Searching for article with slug: ${slug}`);

    const article = await ElectionArticle.findOne({ slug });

    if (!article) {
        console.log('Article not found!');
        process.exit(0);
    }

    console.log('Article found:', article._id);
    console.log('Title:', article.title_en);

    console.log('Attempting update with sample data...');

    try {
        const updated = await ElectionArticle.findByIdAndUpdate(
            article._id,
            {
                $set: {
                    title_en: article.title_en + ' (Updated)',
                    // We simulate a partial update
                }
            },
            { new: true, runValidators: true }
        );
        console.log('Update successful:', updated?.title_en);
    } catch (error) {
        console.error('Update failed:', error);
    }

    process.exit(0);
}

debug().catch(console.error);
