import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ColumnArticle } from '@/models/ElectionContent';

export async function GET() {
    try {
        await dbConnect();
        
        const existing = await ColumnArticle.findOne({ slug: "future-of-ai-politics-2026" });
        if (existing) {
            return NextResponse.json({ success: true, message: "Already seeded!" });
        }
        
        await ColumnArticle.create({
          editor: "The Leaders Editorial",
          title_en: "The Future of AI in Modern Politics",
          title_ne: "आधुनिक राजनीतिमा एआईको भविष्य",
          excerpt_en: "An in-depth look at how artificial intelligence is shaping campaign strategies and voter engagement.",
          excerpt_ne: "कसरी कृत्रिम बुद्धिमत्ताले चुनावी रणनीति र मतदाता संलग्नतालाई आकार दिइरहेको छ भन्ने बारे गहिरो अध्ययन।",
          content_en: "<h2>The Dawn of AI Campaigns</h2><p>As we move towards 2026, technology is fundamentally changing how political strategists approach demographics.</p><p><img src=\"https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg\" alt=\"campaign tech\"></p><p>Generative AI will soon be involved in everything from automated personalized policy mailers to hyper-localized digital ads based on real-time community sentiment.</p>",
          content_ne: "<h2>एआई अभियानहरूको सुरुवात</h2><p>हामी २०२६ तिर अघि बढ्दै गर्दा, प्रविधिले आधारभूत रूपमा परिवर्तन गर्दैछ...</p>",
          slug: "future-of-ai-politics-2026",
          tags: ["AI", "Technology", "Future"],
          category: "Technology",
          status: "published",
          views: 0
        });
        
        return NextResponse.json({ success: true, message: "Test article seeded successfully!" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
