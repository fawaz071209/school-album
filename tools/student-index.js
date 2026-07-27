// tools/student-index.js
// Re-exposes [id, name] pairs from the master data file so the CSV
// build script can match Google Form responses to the right student.
import { students } from '../assets/js/students-data.js';

// Only students with real names — skip "Student 42" placeholders so CSV
// rows can't accidentally fuzzy-match a generic label.
export const NAMES_FOR_MATCHING = students
  .filter((s) => !/^Student \d+$/.test(s.name))
  .map((s) => [s.id, s.name]);
