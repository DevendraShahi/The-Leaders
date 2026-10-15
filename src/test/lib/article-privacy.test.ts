import { describe, expect, it } from 'vitest';
import Article from '@/models/Article';

describe('article privacy schema', () => {
    it('excludes editorial workflow data from default article queries', () => {
        expect(Article.schema.path('editorialWorkflow').options.select).toBe(false);
    });
});
