import { z } from "zod";
import { articleCardSchema, articleDetailSchema, bilingualSchema, briefCardSchema, briefDetailSchema, pageSchema, factCheckCardSchema, factCheckDetailSchema, leaderCardSchema, leaderDetailSchema, partyCardSchema, manifestoCardSchema, snapshotSchema, historyEpisodeSchema, historyEraSchema, candidateCardSchema } from "./schemas";
const home = z.object({ countdown: z.object({ electionDate: z.string(), label: bilingualSchema }), leadBrief: briefCardSchema.nullable(), ticker: z.object({ scope: z.enum(["today", "latest"]), items: z.array(z.object({ slug: z.string(), title: bilingualSchema, date: z.string() })) }), articles: z.array(articleCardSchema), coverage: z.array(articleCardSchema), factChecks: z.array(factCheckCardSchema) });
const search = z.object({ articles: z.array(articleCardSchema), authors: z.array(bilingualSchema).default([]), leaders: z.array(leaderCardSchema), briefs: z.array(briefCardSchema), factChecks: z.array(factCheckCardSchema), episodes: z.array(historyEpisodeSchema) });
export function responseContract(path: string): z.ZodType | undefined {
    const route = path.split("?")[0];
    if (route === "/api/v1/home") return home;
    if (route === "/api/v1/search") return search;
    if (route === "/api/v1/authors") return z.object({ items: z.array(bilingualSchema) });
    if (route === "/api/v1/articles") return pageSchema(articleCardSchema);
    if (route.startsWith("/api/v1/articles/")) return articleDetailSchema;
    if (route === "/api/v1/briefs") return pageSchema(briefCardSchema);
    if (route.startsWith("/api/v1/briefs/")) return briefDetailSchema;
    if (route === "/api/v1/fact-checks") return pageSchema(factCheckCardSchema);
    if (route.startsWith("/api/v1/fact-checks/")) return factCheckDetailSchema;
    if (route === "/api/v1/leaders") return pageSchema(leaderCardSchema);
    if (route.startsWith("/api/v1/leaders/")) return leaderDetailSchema;
    if (route === "/api/v1/parties") return z.object({ items: z.array(partyCardSchema) });
    if (route === "/api/v1/manifestos") return z.object({ items: z.array(manifestoCardSchema) });
    if (route === "/api/v1/snapshot") return snapshotSchema;
    if (route === "/api/v1/candidates") return pageSchema(candidateCardSchema).extend({ parties: z.array(z.string()), districts: z.array(z.string()) });
    if (route.startsWith("/api/v1/candidates/")) return candidateCardSchema.extend({ qualification: z.string(), experience: z.string() });
    if (route === "/api/v1/history") return z.object({ eras: z.array(historyEraSchema), records: z.array(z.object({ id: z.string(), title: bilingualSchema, content: bilingualSchema, date: z.string(), image: z.string() })) });
    if (route.startsWith("/api/v1/history/")) return historyEpisodeSchema.extend({ eraTitle: bilingualSchema, period: bilingualSchema });
    return undefined;
}
