const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '../../src/lib/public-read/schemas.ts');
const destination = path.resolve(__dirname, '../src/api/schemas.ts');
const code = '// Generated from src/lib/public-read/schemas.ts by npm run sync:contracts.\n' + fs.readFileSync(source, 'utf8');
if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== code) fs.writeFileSync(destination, code);
