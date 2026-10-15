import { describe, it, expect, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { apiOk, apiFail } from '@/app/api/v1/http';
import { GET as retired } from '@/app/api/retired/route';
import { readPageParams } from '@/lib/public-read/shape';
vi.mock('next/cache', () => ({revalidatePath:vi.fn(),revalidateTag:vi.fn()}));
import { POST as revalidate } from '@/app/api/revalidate/route';

describe('lean news resource boundaries', () => {
    it('caches successful public reads but never error responses', () => {
        expect(apiOk(z.object({title:z.string()}),{title:'Published'}).headers.get('Cache-Control')).toContain('s-maxage=3600');
        expect(apiFail('unavailable').headers.get('Cache-Control')).toBe('no-store');
        expect(apiOk(z.string(), 4 as never).headers.get('Cache-Control')).toBe('no-store');
    });
    it('retired endpoints return a cacheable 410 without database work', async () => {
        const response = retired();
        expect(response.status).toBe(410);
        expect(response.headers.get('Cache-Control')).toContain('s-maxage=86400');
        expect((await response.json()).success).toBe(false);
        for(const path of ['src/app/election-2026','src/app/api/election','src/app/api/admin/perplexity-ingest','.github/workflows/update-news.yml']) expect(existsSync(path)).toBe(false);
    });
    it('bounds pagination and removes unattended app polling', () => {
        expect(readPageParams(new URLSearchParams('page=999999999&limit=999999'))).toEqual({page:1000,limit:50,skip:49950});
        for (const file of ['mobile/src/services/useAdminAccount.ts','mobile/src/features/daily-social/DailyEditions.tsx']) expect(readFileSync(file,'utf8')).toContain('refetchInterval: false');
    });
    it('requires a configured bearer secret before invalidating content', async () => {
        const prior = process.env.REVALIDATE_SECRET; delete process.env.REVALIDATE_SECRET;
        try { expect((await revalidate(new Request('https://example.com/api/revalidate',{method:'POST',body:'{}'}))).status).toBe(401); }
        finally { if(prior !== undefined) process.env.REVALIDATE_SECRET=prior; }
    });
});
