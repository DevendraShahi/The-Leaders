import path from "path";
import { inflateRawSync } from "zlib";

export interface ParsedSheetRow {
    rowNumber: number;
    values: Record<string, string>;
}

export class SpreadsheetParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SpreadsheetParseError";
    }
}

function decodeXmlEntities(value: string): string {
    return value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'")
        .replace(/&#10;/g, "\n")
        .replace(/&#13;/g, "\r")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
            String.fromCodePoint(Number.parseInt(hex, 16))
        )
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function columnLettersToIndex(letters: string): number {
    let index = 0;
    const normalized = letters.toUpperCase();
    for (let i = 0; i < normalized.length; i += 1) {
        const code = normalized.charCodeAt(i);
        if (code < 65 || code > 90) {
            return 0;
        }
        index = index * 26 + (code - 64);
    }
    return Math.max(0, index - 1);
}

function parseDelimitedRows(text: string, delimiter: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];

        if (inQuotes) {
            if (char === "\"") {
                const nextChar = text[i + 1];
                if (nextChar === "\"") {
                    cell += "\"";
                    i += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += char;
            }
            continue;
        }

        if (char === "\"") {
            inQuotes = true;
            continue;
        }

        if (char === delimiter) {
            row.push(cell);
            cell = "";
            continue;
        }

        if (char === "\n") {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
            continue;
        }

        if (char === "\r") {
            const nextChar = text[i + 1];
            if (nextChar === "\n") {
                i += 1;
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
            continue;
        }

        cell += char;
    }

    row.push(cell);
    rows.push(row);

    while (rows.length > 0 && rows[rows.length - 1]!.every((value) => value.trim() === "")) {
        rows.pop();
    }

    return rows;
}

function normalizeHeaders(rawHeaders: string[]): string[] {
    const seen = new Map<string, number>();
    return rawHeaders.map((header, index) => {
        const base = header.trim() || `column_${index + 1}`;
        const currentCount = seen.get(base) || 0;
        seen.set(base, currentCount + 1);
        if (currentCount === 0) return base;
        return `${base}_${currentCount + 1}`;
    });
}

function rowsToObjects(rows: string[][]): ParsedSheetRow[] {
    if (!rows.length) return [];

    const headerIndex = rows.findIndex((row) => row.some((cell) => cell.trim() !== ""));
    if (headerIndex === -1) return [];

    const headers = normalizeHeaders(rows[headerIndex] || []);
    const output: ParsedSheetRow[] = [];

    for (let i = headerIndex + 1; i < rows.length; i += 1) {
        const row = rows[i] || [];
        const values: Record<string, string> = {};
        let hasValue = false;

        for (let col = 0; col < headers.length; col += 1) {
            const key = headers[col];
            if (!key) continue;
            const rawValue = String(row[col] || "").trim();
            values[key] = rawValue;
            if (rawValue !== "") hasValue = true;
        }

        if (!hasValue) continue;
        output.push({ rowNumber: i + 1, values });
    }

    return output;
}

function detectDelimiter(text: string): string {
    const firstLine = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0);

    if (!firstLine) return ",";

    const candidates = [",", "\t", ";"];
    const counts = candidates.map((candidate) => ({
        delimiter: candidate,
        count: firstLine.split(candidate).length - 1,
    }));
    counts.sort((a, b) => b.count - a.count);
    return counts[0]?.delimiter || ",";
}

function parseDelimitedBuffer(buffer: Buffer): ParsedSheetRow[] {
    const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
    const delimiter = detectDelimiter(text);
    const rows = parseDelimitedRows(text, delimiter);
    return rowsToObjects(rows);
}

function parseZipEntries(buffer: Buffer): Map<string, Buffer> {
    const entries = new Map<string, Buffer>();
    const eocdSignature = 0x06054b50;

    let eocdOffset = -1;
    const searchStart = Math.max(0, buffer.length - 0xffff - 22);
    for (let offset = buffer.length - 22; offset >= searchStart; offset -= 1) {
        if (buffer.readUInt32LE(offset) === eocdSignature) {
            eocdOffset = offset;
            break;
        }
    }

    if (eocdOffset === -1) {
        throw new SpreadsheetParseError("Invalid XLSX file: missing ZIP directory.");
    }

    const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
    const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
    let cursor = centralDirectoryOffset;
    const end = centralDirectoryOffset + centralDirectorySize;

    while (cursor < end) {
        const centralSignature = buffer.readUInt32LE(cursor);
        if (centralSignature !== 0x02014b50) {
            throw new SpreadsheetParseError("Invalid XLSX file: corrupt ZIP entry.");
        }

        const compressionMethod = buffer.readUInt16LE(cursor + 10);
        const compressedSize = buffer.readUInt32LE(cursor + 20);
        const fileNameLength = buffer.readUInt16LE(cursor + 28);
        const extraLength = buffer.readUInt16LE(cursor + 30);
        const commentLength = buffer.readUInt16LE(cursor + 32);
        const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
        const fileName = buffer
            .slice(cursor + 46, cursor + 46 + fileNameLength)
            .toString("utf8")
            .replace(/\\/g, "/");

        const localSignature = buffer.readUInt32LE(localHeaderOffset);
        if (localSignature !== 0x04034b50) {
            throw new SpreadsheetParseError("Invalid XLSX file: bad local ZIP header.");
        }

        const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
        const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
        const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
        const compressedData = buffer.slice(dataOffset, dataOffset + compressedSize);

        let data: Buffer;
        if (compressionMethod === 0) {
            data = compressedData;
        } else if (compressionMethod === 8) {
            data = inflateRawSync(compressedData);
        } else {
            throw new SpreadsheetParseError(
                `Unsupported XLSX compression method: ${compressionMethod}`
            );
        }

        entries.set(fileName, data);
        cursor += 46 + fileNameLength + extraLength + commentLength;
    }

    return entries;
}

function resolveSheetPath(
    workbookXml: string,
    workbookRelsXml: string,
    entryPaths: Set<string>
): string | null {
    const sheetMatch = workbookXml.match(/<sheet\b[^>]*r:id="([^"]+)"[^>]*\/?>/i);
    const firstSheetRelId = sheetMatch?.[1];

    if (firstSheetRelId) {
        const relRegex = /<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>/gi;
        let relMatch: RegExpExecArray | null = null;
        while ((relMatch = relRegex.exec(workbookRelsXml))) {
            if (relMatch[1] !== firstSheetRelId) continue;
            const rawTarget = relMatch[2] || "";
            const normalizedTarget = rawTarget.replace(/\\/g, "/").replace(/^\//, "");
            const resolvedPath = normalizedTarget.startsWith("xl/")
                ? normalizedTarget
                : `xl/${normalizedTarget}`;
            if (entryPaths.has(resolvedPath)) {
                return resolvedPath;
            }
        }
    }

    const fallbackSheets = Array.from(entryPaths)
        .filter((entryPath) => /^xl\/worksheets\/.+\.xml$/i.test(entryPath))
        .sort((a, b) => a.localeCompare(b));
    return fallbackSheets[0] || null;
}

function parseSharedStrings(sharedStringsXml: string): string[] {
    const sharedStrings: string[] = [];
    const itemRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/gi;
    let itemMatch: RegExpExecArray | null = null;

    while ((itemMatch = itemRegex.exec(sharedStringsXml))) {
        const itemContent = itemMatch[1] || "";
        const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;
        let textMatch: RegExpExecArray | null = null;
        let combined = "";

        while ((textMatch = textRegex.exec(itemContent))) {
            combined += decodeXmlEntities(textMatch[1] || "");
        }

        sharedStrings.push(combined);
    }

    return sharedStrings;
}

function extractCellValue(cellXml: string, sharedStrings: string[]): string {
    const attrsMatch = cellXml.match(/^<c\b([^>]*)/i);
    const attrs = attrsMatch?.[1] || "";
    const type = attrs.match(/\bt="([^"]+)"/i)?.[1] || "";

    if (/\/>\s*$/.test(cellXml)) {
        return "";
    }

    if (type === "inlineStr") {
        const inlineMatch = cellXml.match(/<is\b[^>]*>([\s\S]*?)<\/is>/i);
        if (!inlineMatch) return "";
        const textRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/gi;
        let textMatch: RegExpExecArray | null = null;
        let combined = "";
        while ((textMatch = textRegex.exec(inlineMatch[1] || ""))) {
            combined += decodeXmlEntities(textMatch[1] || "");
        }
        return combined;
    }

    const valueMatch = cellXml.match(/<v\b[^>]*>([\s\S]*?)<\/v>/i);
    const rawValue = decodeXmlEntities(valueMatch?.[1] || "");
    if (type === "s") {
        const index = Number.parseInt(rawValue, 10);
        return Number.isFinite(index) ? sharedStrings[index] || "" : "";
    }
    if (type === "b") {
        return rawValue === "1" ? "TRUE" : "FALSE";
    }
    return rawValue;
}

function parseXlsxBuffer(buffer: Buffer): ParsedSheetRow[] {
    const entries = parseZipEntries(buffer);
    const entryPaths = new Set(entries.keys());
    const workbookXml = entries.get("xl/workbook.xml")?.toString("utf8");
    const workbookRelsXml = entries.get("xl/_rels/workbook.xml.rels")?.toString("utf8");

    if (!workbookXml || !workbookRelsXml) {
        throw new SpreadsheetParseError("Invalid XLSX file: workbook metadata is missing.");
    }

    const sheetPath = resolveSheetPath(workbookXml, workbookRelsXml, entryPaths);
    if (!sheetPath) {
        throw new SpreadsheetParseError("No worksheet found in XLSX file.");
    }

    const worksheetXml = entries.get(sheetPath)?.toString("utf8");
    if (!worksheetXml) {
        throw new SpreadsheetParseError("Unable to read worksheet data from XLSX file.");
    }

    const sharedStringsXml = entries.get("xl/sharedStrings.xml")?.toString("utf8") || "";
    const sharedStrings = sharedStringsXml ? parseSharedStrings(sharedStringsXml) : [];

    const tableRows: { rowNumber: number; cells: string[] }[] = [];
    const rowRegex = /<row\b([^>]*)>([\s\S]*?)<\/row>/gi;
    let rowMatch: RegExpExecArray | null = null;
    let fallbackRowNumber = 1;

    while ((rowMatch = rowRegex.exec(worksheetXml))) {
        const rowAttrs = rowMatch[1] || "";
        const rowContent = rowMatch[2] || "";
        const parsedRowNumber = Number.parseInt(rowAttrs.match(/\br="(\d+)"/i)?.[1] || "", 10);
        const rowNumber = Number.isFinite(parsedRowNumber) ? parsedRowNumber : fallbackRowNumber;
        fallbackRowNumber = rowNumber + 1;

        const cells: string[] = [];
        let implicitColumn = 0;
        const cellRegex = /<c\b[^>]*\/>|<c\b[^>]*>[\s\S]*?<\/c>/gi;
        let cellMatch: RegExpExecArray | null = null;

        while ((cellMatch = cellRegex.exec(rowContent))) {
            const cellXml = cellMatch[0] || "";
            const attrsMatch = cellXml.match(/^<c\b([^>]*)/i);
            const attrs = attrsMatch?.[1] || "";
            const reference = attrs.match(/\br="([A-Za-z]+)\d+"/)?.[1];
            const columnIndex = reference ? columnLettersToIndex(reference) : implicitColumn;
            implicitColumn = columnIndex + 1;
            cells[columnIndex] = extractCellValue(cellXml, sharedStrings);
        }

        if (cells.some((cell) => String(cell || "").trim() !== "")) {
            tableRows.push({ rowNumber, cells });
        }
    }

    if (!tableRows.length) return [];

    const headers = normalizeHeaders(tableRows[0]?.cells || []);
    const output: ParsedSheetRow[] = [];

    for (let i = 1; i < tableRows.length; i += 1) {
        const currentRow = tableRows[i];
        if (!currentRow) continue;

        const values: Record<string, string> = {};
        let hasValue = false;

        for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
            const header = headers[columnIndex];
            if (!header) continue;
            const value = String(currentRow.cells[columnIndex] || "").trim();
            values[header] = value;
            if (value !== "") hasValue = true;
        }

        if (!hasValue) continue;
        output.push({ rowNumber: currentRow.rowNumber, values });
    }

    return output;
}

export function parseSpreadsheetBuffer(fileName: string, buffer: Buffer): ParsedSheetRow[] {
    const extension = path.extname(fileName || "").toLowerCase();

    if (extension === ".xlsx" || extension === ".xlsm") {
        return parseXlsxBuffer(buffer);
    }

    if (extension === ".xls") {
        throw new SpreadsheetParseError(
            "Legacy .xls files are not supported. Please save as .xlsx or CSV."
        );
    }

    return parseDelimitedBuffer(buffer);
}
