import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");

const EXCLUDED_SEGMENTS = new Set(["api", "admin"]);

function walk(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (EXCLUDED_SEGMENTS.has(entry.name)) continue;
            out.push(...walk(full));
        } else if (entry.isFile() && entry.name === "page.tsx") {
            out.push(full);
        }
    }
    return out;
}

function routeFromFile(file) {
    const rel = path.relative(APP_DIR, file).replace(/\\/g, "/");
    if (rel === "page.tsx") return "/";
    const withoutPage = rel.replace(/\/page\.tsx$/, "");
    return `/${withoutPage}`.replace(/\/+/g, "/");
}

function hasMetadata(source) {
    return (
        /export\s+const\s+metadata\b/m.test(source) ||
        /export\s+async\s+function\s+generateMetadata\s*\(/m.test(source)
    );
}

function hasJsonLd(source) {
    return /application\/ld\+json/.test(source);
}

const files = walk(APP_DIR);
const issues = [];

function hasLayoutMetadataFor(file) {
    let currentDir = path.dirname(file);
    while (currentDir.startsWith(APP_DIR)) {
        const layoutFile = path.join(currentDir, "layout.tsx");
        if (fs.existsSync(layoutFile)) {
            const layoutSource = fs.readFileSync(layoutFile, "utf8");
            if (hasMetadata(layoutSource)) return true;
        }
        if (currentDir === APP_DIR) break;
        currentDir = path.dirname(currentDir);
    }
    return false;
}

for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const route = routeFromFile(file);
    const dynamicRoute = route.includes("[");
    const hasOwnOrInheritedMetadata = hasMetadata(source) || hasLayoutMetadataFor(file);

    if (!hasOwnOrInheritedMetadata) {
        issues.push({ type: "missing-metadata", route, file });
    }
    if (dynamicRoute && !hasJsonLd(source)) {
        issues.push({ type: "missing-jsonld", route, file });
    }
}

if (issues.length === 0) {
    console.log("SEO audit passed: no metadata/schema issues found.");
    process.exit(0);
}

console.log(`SEO audit found ${issues.length} issue(s):`);
for (const issue of issues) {
    console.log(`- [${issue.type}] ${issue.route} (${path.relative(ROOT, issue.file)})`);
}
process.exit(1);
