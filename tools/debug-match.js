import { NAMES_FOR_MATCHING } from './student-index.js';

function normalizeName(name) {
  return name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.'"-]/g, ' ').replace(/\s+/g, ' ').trim();
}
function nameVariants(name) {
  const normalized = normalizeName(name);
  const words = normalized.split(' ');
  return new Set([normalized, words.slice().reverse().join(' ')]);
}
function tokenVariants(token) {
  const variants = new Set([token]);
  const aliases = {
    olowolaiyemo: 'olowolayemo', olowolayemo: 'olowolaiyemo',
    faridah: 'fareedah', fareedah: 'faridah',
    aishat: 'aisha', aisha: 'aishat',
  };
  if (aliases[token]) variants.add(aliases[token]);
  return variants;
}
function nameTokens(name) {
  return normalizeName(name).split(' ').filter((w) => w.length > 1);
}
function tokensMatch(aTokens, bTokens) {
  const expandedA = aTokens.flatMap((t) => [...tokenVariants(t)]);
  const expandedB = bTokens.flatMap((t) => [...tokenVariants(t)]);
  const setB = new Set(expandedB);
  const overlap = expandedA.filter((t) => setB.has(t)).length;
  const minSize = Math.min(aTokens.length, bTokens.length);
  return minSize > 0 && overlap >= minSize && overlap >= 2;
}

const tests = ['Fareedah Olowolaiyemo', 'Aishat Bukola Bolarinwa'];
for (const t of tests) {
  const targets = nameVariants(t);
  console.log('\n===', t, '===');
  const exact = NAMES_FOR_MATCHING.filter(([, n]) => [...nameVariants(n)].some((v) => targets.has(v)));
  console.log('exact', exact);
  const tt = [...targets].map(nameTokens);
  const fuzzy = NAMES_FOR_MATCHING.filter(([, n]) => tt.some((x) => tokensMatch(x, nameTokens(n))));
  console.log('fuzzy', fuzzy);
}
