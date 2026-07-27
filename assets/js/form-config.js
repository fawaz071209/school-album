// assets/js/form-config.js
//
// Fill these two values in after you create your Google Form — see
// README.md "Setting up pre-filled links" for exact steps.
//
// FORM_BASE_URL: the form's viewform URL (ends in /viewform)
// ID_ENTRY_FIELD: the entry.XXXXXXXXX code for your "Student ID" question
//
// Once both are set, every student's modal/portfolio page automatically
// gets a "Fill In Your Info" button linking straight to a copy of the
// form with THEIR id already filled in — they never see or type it.

export const FORM_BASE_URL = 'https://docs.google.com/forms/d/e/PASTE_YOUR_FORM_ID_HERE/viewform';
export const ID_ENTRY_FIELD = 'entry.PASTE_YOUR_ENTRY_CODE_HERE';

export function buildPrefilledFormLink(studentId) {
  const isConfigured =
    !FORM_BASE_URL.includes('PASTE_YOUR_FORM_ID_HERE') &&
    !ID_ENTRY_FIELD.includes('PASTE_YOUR_ENTRY_CODE_HERE');

  if (!isConfigured) return null; // link hidden until you configure this file

  const url = new URL(FORM_BASE_URL);
  url.searchParams.set('usp', 'pp_url');
  url.searchParams.set(ID_ENTRY_FIELD, String(studentId));
  return url.toString();
}
