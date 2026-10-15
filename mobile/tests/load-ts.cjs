const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
module.exports = function loader(overrides = {}, dev = true) {
    const cache = new Map();
    function load(relative) {
        const filename = path.isAbsolute(relative) ? relative : path.resolve(root, relative);
        if (cache.has(filename)) return cache.get(filename).exports;
        const module = { exports: {} }; cache.set(filename, module);
        const scopedRequire = createRequire(filename);
        const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
        new Function('require', 'module', 'exports', '__DEV__', compiled)((id) => {
            if (Object.hasOwn(overrides, id)) return overrides[id];
            if (id.startsWith('@/') || id.startsWith('.')) {
                const target = id.startsWith('@/') ? path.resolve(root, 'src', id.slice(2)) : path.resolve(path.dirname(filename), id);
                if (Object.hasOwn(overrides, target)) return overrides[target];
                if (fs.existsSync(target + '.json')) return scopedRequire(target + '.json');
                if (fs.existsSync(target + '.ts')) return load(target + '.ts');
            }
            return scopedRequire(id);
        }, module, module.exports, dev);
        return module.exports;
    }
    return load;
};
