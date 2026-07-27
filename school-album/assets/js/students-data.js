// assets/js/students-data.js
//
// SINGLE SOURCE OF TRUTH for every student in the album.
//
// Previously this same information (names, image paths, courses, emails)
// was copy-pasted separately inside index.html AND portfolio.html, which
// meant every update had to be made twice and could drift out of sync.
// Now there is exactly one place to edit.
//
// TO ADD OR EDIT A STUDENT:
//   - Add/change an entry in NAMES, IMAGES, EMAILS below (by numeric id).
//   - Everything else (gallery card, search, modal) updates automatically.
//   - No other file needs to change.

import { PERSONAL_DETAILS } from './personal-details.generated.js';

// Real roster size — ids 0-53 all have entries in NAMES below.
// Raise this only after adding the new student(s) to NAMES/IMAGES/EMAILS.
const TOTAL_STUDENTS = 54;

const NOT_SHARED = 'Not shared yet';

function personalDetailsFor(id) {
  const d = PERSONAL_DETAILS[id];
  return {
    hasPortfolio: !!d,
    bestFriend: d?.bestFriend || NOT_SHARED,
    bestSubject: d?.bestSubject || NOT_SHARED,
    quote: d?.quote || NOT_SHARED,
    universityGoal: d?.universityGoal || NOT_SHARED,
    teacherMiss: d?.teacherMiss || NOT_SHARED,
    whatMiss: d?.whatMiss || NOT_SHARED,
  };
}

function sortStudentsForDisplay(list) {
  return [...list].sort((a, b) => {
    // Students who submitted yearbook info first; "Not shared yet" later.
    if (a.hasPortfolio !== b.hasPortfolio) return a.hasPortfolio ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// id -> full name (only known students need an entry; unknown ids fall
// back to "Student N" automatically)
const NAMES = {
  0: 'JINADU FAWAZ',
  1: 'OLUWAFERONMI MARTIN',
  2: 'SERIKI HIKMAH',
  3: 'CHINEMELUM EBUBU',
  4: 'ALAWODE YEWANDE',
  5: 'ADESUKO IREMIDE',
  8: 'AWE MAVELOUS',
  10: 'OGBONNA VICTOR',
  12: 'ADISA ABDULSALAM',
  15: 'OLOWOLAYEMO FAREEDAH',
  16: 'OLAJIDE ABDUL-WARIS',
  18: 'ERIK PRINCESS',
  19: 'JINADU FIRDAUS',
  20: 'LINUS ERYKAH',
  21: 'OLAREWAJU TEMILOLA',
  22: 'AYANDA ZAINAB',
  23: 'OGHOBASE VICTOR',
  24: 'MUSA JABIR',
  26: 'OLAYEMI JOSEPH',
  28: 'BELLO HABIBAH',
  29: 'WILLIAMS DANIEL',
  30: 'OLATUNDE IBUKUN',
  31: 'MOHAMMED KAMEELAH',
  32: 'OJEMBE ANJOLAH',
  33: 'AKANDE ZAINAB',
  34: 'SALIU AJOKE',
  36: 'BILAL and SANI MOHAMMED',
  38: 'IBRAHIM MARIAM',
  39: 'OLUWASEUN OLUWATOSIN',
  6: 'OGUNLEYE DIANA',
  7: 'ADEWUSI ROFIAH',
  9: 'GODWIN DAVID',
  11: 'MEMUDU SOFIAT',
  13: 'EZE BONAVENTURE',
  14: 'ADEAGBO DAVID',
  17: 'YUSUF OMOTOSHO',
  25: 'AYENI DAMILOLA',
  27: 'SALAMI ALIYAH',
  35: 'OGUNSEYE USMAN',
  37: 'ADEOYE ABDULROQEEB',
  40: 'ANIMASHUAN MUIZ',
  41: 'NEBEUWA CHARLES',
  42: 'YUSUF FARIDAH',
  43: 'ABIODUN OYINKANSOLA',
  44: 'BOLARINWA AISHA BUKOLA',
  45: 'VICTOR ANGEL',
  46: 'ODUBIYI TOFUNMI',
  47: 'ADEDOJA GBEMISOLA',
  48: 'HASSAN AZEEMAH',
  49: 'EKEMEZIE STEPHANIE',
  50: 'LAWAL RODIAH',
  51: 'ABUBAKAR FATIMA',
  52: 'TIJANI MUBARAK',
  53: 'USMAN SAIDAH',
};

// id -> image path (relative to the project root, same "pics/" folder
// you already have — nothing needs to be moved)
const IMAGES = {
  0: './class mate 001.jpg',
  1: './class mate 002.jpg',
  2: './class mate 003.jpg',
  3: './class mate 004.jpg',
  4: './class mate 005.jpg',
  5: './class mate 006.jpg',
  6: './class mate 007.jpg',
  7: './class mate 008.jpg',
  8: './class mate 009.jpg',
  9: './class mate 010.jpg',
  10: './class mate 011.jpg',
  11: './class mate 012.jpg',
  12: './class mate 013.jpg',
  13: './class mate 014.jpg',
  14: './pics/IMG-20260702-WA0011.jpg',
  15: './pics/IMG-20260702-WA0012.jpg',
  16: './pics/IMG-20260702-WA0015.jpg',
  17: './pics/IMG-20260702-WA0014.jpg',
  18: './pics/IMG-20260702-WA0019.jpg',
  19: './pics/IMG-20260702-WA0044.jpg',
  20: './pics/IMG-20260702-WA0046.jpg',
  21: './pics/IMG-20260702-WA0047.jpg',
  22: './pics/IMG-20260702-WA0042.jpg',
  23: './pics/IMG-20260702-WA0038.jpg',
  24: './pics/IMG-20260702-WA0036.jpg',
  25: './pics/IMG-20260702-WA0034.jpg',
  26: './pics/IMG-20260702-WA0032.jpg',
  27: './pics/IMG-20260702-WA0028.jpg',
  28: './pics/IMG-20260702-WA0029.jpg',
  29: './pics/IMG-20260702-WA0030.jpg',
  30: './pics/IMG-20260702-WA0027.jpg',
  31: './pics/IMG-20260702-WA0026.jpg',
  32: './pics/IMG-20260702-WA0024.jpg',
  33: './pics/IMG-20260702-WA0023.jpg',
  34: './pics/IMG-20260702-WA0022.jpg',
  35: './pics/IMG-20260702-WA0019.jpg',
  36: './pics/IMG-20260702-WA0018.jpg',
  37: './pics/IMG-20260702-WA0017.jpg',
  38: './pics/IMG-20260702-WA0016.jpg',
  39: './pics/IMG-20260709-WA0252.jpg',
  40: './pics/IMG-20260709-WA0256.jpg',
  41: './pics/IMG-20260709-WA0237.jpg',
  42: './pics/IMG-20260709-WA0241.jpg',
  43: './pics/IMG-20260709-WA0242.jpg',
  44: './pics/IMG-20260709-WA0243.jpg',
  45: './pics/IMG-20260709-WA0245.jpg',
  46: './pics/IMG-20260709-WA0244.jpg',
  47: './pics/IMG-20260709-WA0234.jpg',
};

// id -> email (only known ones; rest get an auto-generated placeholder)
const EMAILS = {
  0: 'fawazjinadu8@gmail.com',
  1: 'Oluwaferonmimartins933@gmail.com',
  2: 'Nataisleng@gmail.com',
  4: 'alawodeyewande234@gmail.com',
  10: 'ogbonnav91@gmail.com',
  12: 'adisaabdulsalam24@gmail.com',
};

// ids known to be in the science stream (mirrors the original portfolio.html logic)
const SCIENCE_STREAM = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 20, 21, 23, 24, 25, 27, 28, 31, 33, 34, 37, 38,
]);

function courseFor(id) {
  if (id === 0) return 'Computer Science';
  if (id === 19) return 'Commerce';
  if (id === 36) return 'Science and Commerce';
  if (SCIENCE_STREAM.has(id)) return 'Sciences';
  return 'General Studies';
}

function bioFor(id, name) {
  if (id === 0) return 'It has been an interesting journey and I loved the way it ended.';
  return `${name} is part of the Seylek CTY College community and is growing their skills through creative learning and collaboration.`;
}

function titleFor(id) {
  return id === 0 ? 'Web Development Student' : 'Student';
}

function imageFor(id) {
  return IMAGES[id] ?? `https://picsum.photos/400/400?random=${id + 1}`;
}

function emailFor(id, name) {
  if (EMAILS[id]) return EMAILS[id];
  // No real email on file — derive a placeholder from their name instead
  // of a generic "studentN@..." address (e.g. "Jinadu Fawaz" -> jinadu.fawaz@gmail.com).
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, '') // strip punctuation (hyphens, apostrophes, etc.)
    .trim()
    .split(/\s+/)
    .join('.');
  return `${slug}@gmail.com`;
}

/** @typedef {{id:number,name:string,title:string,course:string,email:string,bio:string,image:string}} Student */

/** @type {Student[]} */
const rawStudents = Array.from({ length: TOTAL_STUDENTS }, (_, id) => {
  const name = NAMES[id] ?? `Student ${id + 1}`;
  return {
    id,
    name,
    title: titleFor(id),
    course: courseFor(id),
    email: emailFor(id, name),
    bio: bioFor(id, name),
    image: imageFor(id),
    ...personalDetailsFor(id),
  };
})
  // Belt-and-suspenders: never render a placeholder "Student N" card,
  // even if TOTAL_STUDENTS is ever raised ahead of adding real names.
  .filter((s) => NAMES[s.id] !== undefined);

// Students who shared their yearbook info (portfolio) are shown first,
// then students who haven't shared yet ("Not shared yet").
export const students = sortStudentsForDisplay(rawStudents);

/** Fast O(1) lookup map, built once. */
const studentsById = new Map(students.map((s) => [s.id, s]));

export function getStudentById(id) {
  return studentsById.get(Number(id)) ?? null;
}

export function searchStudents(query) {
  const q = query.trim().toLowerCase();
  if (!q) return students;
  return students.filter((s) => s.name.toLowerCase().includes(q));
}
