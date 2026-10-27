import { describe, it, expect } from "vitest";
import {
    ACTIVE_NEWS_SOURCES,
    SOURCE_DISPLAY_MAP,
    getLiveAndArchivalDispatches,
    getInvestigativeReports,
    getOpinionColumns
} from "@/lib/news-feed";

describe("news-feed multi-source bilingual news architecture", () => {
    it("defines authentic Nepali and English active news sources", () => {
        expect(ACTIVE_NEWS_SOURCES.length).toBeGreaterThanOrEqual(4);

        const sourceNames = ACTIVE_NEWS_SOURCES.map((s) => s.name);
        expect(sourceNames).toContain("OnlineKhabar");
        expect(sourceNames).toContain("Setopati");
        expect(sourceNames).toContain("Ratopati");
        expect(sourceNames).toContain("Himal Khabar");

        const languages = ACTIVE_NEWS_SOURCES.map((s) => s.language);
        expect(languages).toContain("ne");
        expect(languages).toContain("en");

        // Verify valid HTTPS URLs
        ACTIVE_NEWS_SOURCES.forEach((s) => {
            expect(s.url).toMatch(/^https:\/\//);
            expect(s.nepaliName.length).toBeGreaterThan(0);
        });
    });

    it("maps source display names with authentic Devanagari equivalents", () => {
        expect(SOURCE_DISPLAY_MAP["OnlineKhabar"].ne).toBe("अनलाइनखबर");
        expect(SOURCE_DISPLAY_MAP["Setopati"].ne).toBe("सेतोपाटी");
        expect(SOURCE_DISPLAY_MAP["Ratopati"].ne).toBe("रातोपाटी");
        expect(SOURCE_DISPLAY_MAP["Himal Khabar"].ne).toBe("हिमाल खबर");
        expect(SOURCE_DISPLAY_MAP["The Leaders Archive"].ne).toBe("द लिडर्स अभिलेख");
    });

    it("returns combined dispatches containing required broadsheet fields", async () => {
        const dispatches = await getLiveAndArchivalDispatches(6);
        expect(Array.isArray(dispatches)).toBe(true);
        expect(dispatches.length).toBeGreaterThan(0);

        dispatches.forEach((item) => {
            expect(item).toHaveProperty("title");
            expect(item).toHaveProperty("slug");
            expect(item).toHaveProperty("date");
            expect(item).toHaveProperty("summary");
            expect(item).toHaveProperty("source");
            expect(item).toHaveProperty("isLiveFeed");

            // Verify title is non-empty
            if (typeof item.title === "string") {
                expect(item.title.length).toBeGreaterThan(0);
            } else {
                expect((item.title.en || item.title.ne || "").length).toBeGreaterThan(0);
            }
        });
    });

    it("returns investigative reports enriched with verified broadsheet artwork or live photography", async () => {
        const reports = await getInvestigativeReports(3);
        expect(Array.isArray(reports)).toBe(true);
        expect(reports.length).toBeGreaterThanOrEqual(3);

        reports.forEach((report) => {
            expect(report.title).toBeDefined();
            expect(report.link).toMatch(/^(\/|https?:\/\/)/);
            expect(report.source).toBeDefined();
            expect(report.image).toBeDefined();
            expect(report.image).toMatch(/^(\/art\/|https?:\/\/)/);
        });
    });

    it("returns columnist opinions with author credentials and pull quotes", async () => {
        const opinions = await getOpinionColumns(3);
        expect(Array.isArray(opinions)).toBe(true);
        expect(opinions.length).toBeGreaterThanOrEqual(2);

        opinions.forEach((op) => {
            expect(op.columnist.name).toBeDefined();
            expect(op.columnist.initials.length).toBeGreaterThanOrEqual(1);
            expect(op.headline).toBeDefined();
            expect(op.pullQuote).toBeDefined();
            expect(op.link).toBeDefined();
        });
    });
});
