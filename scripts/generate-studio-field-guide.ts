import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { studioTemplateExamples } from '../src/lib/post-studio/template-examples';

async function main() {
    const output = resolve('public/studio/template-guide');
    const previous = await readFile(resolve(output, 'manifest.json'), 'utf8').then(raw => JSON.parse(raw).examples as { id: string; regions?: unknown }[]).catch(() => []);
    const examples = studioTemplateExamples().map(example => ({ ...example, regions: previous.find(item => item.id === example.id)?.regions ?? [] }));
    await mkdir(resolve(output, 'samples'), { recursive: true });
    await mkdir(resolve(output, 'previews'), { recursive: true });
    const manifest = { notice: 'Training examples only. All match figures and announcements are illustrative. Replace before publishing.', examples };
    await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    await writeFile(resolve(output, 'data.js'), 'window.STUDIO_GUIDE_DATA = ' + JSON.stringify(manifest).replace(/</g, '\\u003c') + ';\n');
    for (const example of examples) await writeFile(resolve(output, `samples/${example.id}.json`), JSON.stringify(example.response, null, 2) + '\n');
    console.log(`Prepared ${examples.length} validated examples, field maps and sample JSON files.`);
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
