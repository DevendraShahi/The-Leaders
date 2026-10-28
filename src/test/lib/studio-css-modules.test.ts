// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const postcss = require('postcss');
const localByDefault = require('next/dist/compiled/postcss-modules-local-by-default');
const directory = resolve('src/components/admin/post-studio');
const modules = readdirSync(directory).filter(name => name.endsWith('.module.css'));

describe('Studio CSS Modules compile with Next.js pure selector rules', () => {
    it.each(modules)('%s scopes every selector to a local class or id', async name => {
        const file = resolve(directory, name);
        await expect(postcss([localByDefault({ mode: 'pure' })]).process(readFileSync(file, 'utf8'), { from: file })).resolves.toBeDefined();
    });
});
