"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchTrendingTopics } from "@/lib/api/news-service";
import { TrendingTopic } from "@/lib/analytics-data";

interface TrendingTopicsSectionProps {
    initialData: TrendingTopic[]; // Fallback/Initial data
}

export function TrendingTopicsSection({ initialData }: TrendingTopicsSectionProps) {
    const [topics, setTopics] = useState<TrendingTopic[]>(initialData);

    useEffect(() => {
        const loadTrends = async () => {
            try {
                const freshTopics = await fetchTrendingTopics();
                if (freshTopics && freshTopics.length > 0) {
                    setTopics(freshTopics);
                }
            } catch (error) {
                console.error("Failed to fetch trending topics:", error);
            }
        };
        loadTrends();
    }, []);

    return (
        <div className="mx-auto max-w-3xl space-y-3">
            {topics.map((topic, index) => (
                <motion.div
                    key={`${topic.topic}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg bg-muted/10 p-4 transition-all hover:bg-muted/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B71C1C]/10 font-bebas text-sm text-[#B71C1C]">
                            {index + 1}
                        </div>
                        <span className="font-semibold text-foreground">{topic.topic}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {(topic.mentions / 1000).toFixed(1)}K mentions
                        </span>
                        <TrendingUp className={`h-4 w-4 ${topic.trend === "up" ? "text-green-500" :
                                topic.trend === "down" ? "text-red-500 rotate-180" :
                                    "text-gray-500"
                            }`} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
