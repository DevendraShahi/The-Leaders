import { z } from "zod";
import { articleDetailSchema } from "@/api/schemas";
export const savedArticleSchema = z.object({ slug: z.string().min(1), source: z.string(), titleEn: z.string(), titleNe: z.string(), excerptEn: z.string(), excerptNe: z.string(), contentEn: z.string(), contentNe: z.string(), savedAt: z.string(), article: articleDetailSchema.optional() });
