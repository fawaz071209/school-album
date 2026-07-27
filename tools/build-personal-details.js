#!/usr/bin/env node
// tools/build-personal-details.js
//
// Reads a Google Form / Sheet CSV export, matches each response to a
// student in students-data.js, and regenerates personal-details.generated.js.
//
// Supports two export formats:
//   • data/responses.csv        — "Student ID" + "Full Name" columns
//   • data/Class Gallery.csv    — "Surname" + "First name" columns
//
// Usage:
//   node tools/build-personal-details.js data/Class\ Gallery.csv data/responses.sample.csv
//   node tools/build-personal-details.js   # merges all CSVs in data/ (except desktop.ini)
//
// Pass multiple files to merge them — later rows overwrite earlier ones.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NAMES_FOR_MATCHING } from './student-index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const outPath = join(__dirname, '..', 'assets', 'js', 'personal-details.generated.js');

function defaultCsvPaths() {
  const preferred = [
    join(dataDir, 'Class Gallery.csv'),
    join(dataDir, 'responses.csv'),
    join(dataDir, 'responses.sample.csv'),
  ].filter((p) => existsSync(p));

  if (preferred.length) return preferred;

  return readdirSync(dataDir)
    .filter((f) => f.toLowerCase().endsWith('.csv'))
    .map((f) => join(dataDir, f));
}

const csvPaths = process.argv.length > 2
  ? process.argv.slice(2)
  : defaultCsvPaths();

const QUESTION_KEYS = {
  bestFriend: 'who is your best friend in class',
  bestSubject: 'what is your best subject',
  quote: 'what is your motivational quote',
  universityGoal: 'what do you want to study in university',
  teacherMiss: 'which teacher will you miss the most',
  whatMiss: 'what will you miss most about seylek',
};

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\r') {
      // ignore, \n handles the line break
    } else if (char === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += char;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** Strip invisible Unicode (Google Sheets RTL marks) and extra whitespace. */
function normalizeHeader(header) {
  return header
    .replace(/[\u200E\u200F\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findColumn(header, ...candidates) {
  const normalized = header.map((h) => normalizeHeader(h));
  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    const idx = normalized.findIndex((h) => h === key || h.startsWith(key));
    if (idx !== -1) return header[idx];
  }
  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    const idx = normalized.findIndex((h) => h.includes(key));
    if (idx !== -1) return header[idx];
  }
  return null;
}

function resolveColumns(header) {
  const questionCols = {};
  for (const [field, fragment] of Object.entries(QUESTION_KEYS)) {
    questionCols[field] = findColumn(header, fragment) ?? '';
  }

  return {
    studentId: findColumn(header, 'Student ID', 'student id'),
    fullName: findColumn(header, 'Full Name', 'full name'),
    surname: findColumn(header, 'Surname', 'surname'),
    firstName: findColumn(header, 'First name', 'first name', 'firstname'),
    ...questionCols,
  };
}

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'"-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Common spelling differences between form answers and gallery names. */
function tokenVariants(token) {
  const variants = new Set([token]);
  const aliases = {
    eric: 'erik',
    erik: 'eric',
    salau: 'saliu',
    saliu: 'salau',
    olowolaiyemo: 'olowolayemo',
    olowolayemo: 'olowolaiyemo',
    maryam: 'mariam',
    mariam: 'maryam',
    faridah: 'fareedah',
    fareedah: 'faridah',
    aishat: 'aisha',
    aisha: 'aishat',
    rofiah: 'rodiah',
    rodiah: 'rofiah',
    abdulroqeeb: 'abdul',
    roqeeb: 'roqeeb',
    azeemah: 'azeemah',
    omotosho: 'omotosho',
    gbemisola: 'gbemisola',
  };
  if (aliases[token]) variants.add(aliases[token]);
  return variants;
}

function nameTokens(name) {
  return normalizeName(name)
    .split(' ')
    .filter((w) => w.length > 1);
}

function nameVariants(name) {
  const normalized = normalizeName(name);
  const words = normalized.split(' ');
  return new Set([normalized, words.slice().reverse().join(' ')]);
}

function tokensMatch(aTokens, bTokens) {
  const expandedA = aTokens.flatMap((t) => [...tokenVariants(t)]);
  const expandedB = bTokens.flatMap((t) => [...tokenVariants(t)]);
  const setB = new Set(expandedB);
  const overlap = expandedA.filter((t) => setB.has(t)).length;
  const minSize = Math.min(aTokens.length, bTokens.length);
  if (minSize === 0) return false;
  // Exact variant match on full string is handled elsewhere; here we require
  // every token from the shorter name to appear in the longer one.
  return overlap >= minSize && overlap >= 2;
}

/** Both names must share every token (via spelling variants) — avoids
 *  "Fareedah Olowolaiyemo" falsely matching "Yusuf Faridah". */
function tokensFullyMatch(aTokens, bTokens) {
  const expandedA = new Set(aTokens.flatMap((t) => [...tokenVariants(t)]));
  const expandedB = new Set(bTokens.flatMap((t) => [...tokenVariants(t)]));
  const aInB = aTokens.every((t) => [...tokenVariants(t)].some((v) => expandedB.has(v)));
  const bInA = bTokens.every((t) => [...tokenVariants(t)].some((v) => expandedA.has(v)));
  return aInB && bInA;
}

function respondentNames(record, cols) {
  const names = new Set();

  const full = record[cols.fullName]?.trim();
  if (full) {
    for (const v of nameVariants(full)) names.add(v);
  }

  const surname = record[cols.surname]?.trim() ?? '';
  const first = record[cols.firstName]?.trim() ?? '';
  if (surname || first) {
    const combined = `${first} ${surname}`.trim();
    for (const v of nameVariants(combined)) names.add(v);
    for (const v of nameVariants(`${surname} ${first}`.trim())) names.add(v);
  }

  return { displayName: full || `${first} ${surname}`.trim() || '(no name given)', names };
}

function matchStudentId(record, cols) {
  const idRaw = cols.studentId ? record[cols.studentId] : '';
  if (idRaw !== undefined && String(idRaw).trim() !== '') {
    const id = Number(String(idRaw).trim());
    if (!Number.isNaN(id)) return id;
  }

  const { names: targets } = respondentNames(record, cols);
  if (!targets.size) return null;

  const exactMatches = NAMES_FOR_MATCHING.filter(([, n]) =>
    [...nameVariants(n)].some((variant) => targets.has(variant))
  );
  if (exactMatches.length === 1) return exactMatches[0][0];
  if (exactMatches.length > 1) return null;

  const targetTokens = [...targets].map((n) => nameTokens(n));
  const fuzzyMatches = NAMES_FOR_MATCHING.filter(([, n]) => {
    const studentTokens = nameTokens(n);
    return targetTokens.some((tt) => tokensMatch(tt, studentTokens));
  });

  if (fuzzyMatches.length === 1) return fuzzyMatches[0][0];

  // Disambiguate partial overlaps (e.g. shared first-name spelling variants).
  const fullMatches = fuzzyMatches.filter(([, n]) => {
    const studentTokens = nameTokens(n);
    return targetTokens.some((tt) => tokensFullyMatch(tt, studentTokens));
  });
  if (fullMatches.length === 1) return fullMatches[0][0];

  return null;
}

function pickField(record, colKey) {
  if (!colKey) return '';
  return record[colKey] ?? '';
}

function processCsv(csvPath) {
  const csvText = readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvText);
  if (rows.length === 0) throw new Error(`CSV appears to be empty: ${csvPath}`);

  const header = rows[0];
  const cols = resolveColumns(header);
  const dataRows = rows.slice(1);

  if (!cols.fullName && !cols.surname && !cols.firstName && !cols.studentId) {
    throw new Error(
      `Could not find name columns in ${csvPath}. Expected "Full Name" or "Surname" + "First name".`
    );
  }

  const details = {};
  const unmatched = [];
  const ambiguous = [];

  for (const row of dataRows) {
    const record = Object.fromEntries(header.map((h, i) => [h, row[i] ?? '']));
    const { displayName } = respondentNames(record, cols);
    const id = matchStudentId(record, cols);

    if (id === null) {
      const exactMatches = NAMES_FOR_MATCHING.filter(([, n]) => {
        const { names: targets } = respondentNames(record, cols);
        return [...nameVariants(n)].some((variant) => targets.has(variant));
      });
      if (exactMatches.length > 1) {
        ambiguous.push(`${displayName} (${csvPath}) → ids ${exactMatches.map((m) => m[0]).join(', ')}`);
      } else {
        unmatched.push(`${displayName} (${csvPath})`);
      }
      continue;
    }

    details[id] = {
      bestFriend: pickField(record, cols.bestFriend),
      bestSubject: pickField(record, cols.bestSubject),
      quote: pickField(record, cols.quote),
      universityGoal: pickField(record, cols.universityGoal),
      teacherMiss: pickField(record, cols.teacherMiss),
      whatMiss: pickField(record, cols.whatMiss),
    };
  }

  return { csvPath, details, unmatched, ambiguous, responseCount: dataRows.length };
}

function main() {
  if (!csvPaths.length) {
    throw new Error('No CSV files found. Pass paths or add files under data/.');
  }

  const merged = {};
  const unmatched = [];
  const ambiguous = [];
  let totalResponses = 0;

  for (const csvPath of csvPaths) {
    const result = processCsv(csvPath);
    totalResponses += result.responseCount;
    Object.assign(merged, result.details);
    unmatched.push(...result.unmatched);
    ambiguous.push(...result.ambiguous);
    console.log(`  ${result.csvPath}: ${Object.keys(result.details).length} matched from ${result.responseCount} response(s)`);
  }

  const body = Object.entries(merged)
    .map(([id, d]) => `  ${id}: ${JSON.stringify(d, null, 2).replace(/\n/g, '\n  ')},`)
    .join('\n');

  const sources = csvPaths.map((p) => p.replace(/\\/g, '/')).join(', ');
  const output = `// assets/js/personal-details.generated.js
//
// AUTO-GENERATED by tools/build-personal-details.js — do not hand-edit.
// Sources: ${sources}
// Generated: ${new Date().toISOString()}
export const PERSONAL_DETAILS = {
${body}
};
`;

  writeFileSync(outPath, output, 'utf8');

  console.log(`\n✔ Matched ${Object.keys(merged).length} student(s) from ${totalResponses} response(s) across ${csvPaths.length} file(s).`);
  console.log(`✔ Wrote ${outPath}`);
  if (Object.keys(merged).length) {
    console.log(`  Student ids: ${Object.keys(merged).sort((a, b) => a - b).join(', ')}`);
  }
  if (ambiguous.length) {
    console.log(`\n⚠ Ambiguous matches (fix NAMES in students-data.js or CSV spelling):`);
    ambiguous.forEach((n) => console.log(`   - ${n}`));
  }
  if (unmatched.length) {
    console.log(`\n⚠ Could not match ${unmatched.length} response(s):`);
    unmatched.forEach((n) => console.log(`   - ${n}`));
    console.log('  Add or fix the name in assets/js/students-data.js so it matches the CSV.');
  }
}

main();
