# Developer Guide — Seylek CTY College Class Gallery

Welcome! This doc explains how the project is put together and how to
work in it safely. Read this before touching code. `README.md` in this
same folder covers the Google Form → CSV workflow in more depth; this
guide focuses on the *code*.

## 1. The big idea

This is a **plain HTML/CSS/JavaScript site** — no framework, no build
step, no `npm install`. You open `index.html` in a browser (or serve
the folder with any static file server) and it just works.

The one important architectural decision to understand:

> **All student data lives in exactly one place:** `assets/js/students-data.js`.
> Every page and component *imports* from it. Nothing is copy-pasted.

If you're ever tempted to hardcode a student's name or edit an HTML
file to "fix" a student's info — stop. Go edit `students-data.js`
instead (or, for personal details, the CSV — see §6).

## 2. Folder map

```
school-album/
├── index.html                     Main page: gallery grid + search + modal
├── portfolio.html                 Standalone single-student page (?student=ID)
├── classmates_all.html            Simple all-photos grid
├── DEVELOPER_GUIDE.md             ← you are here
├── README.md                      Non-technical setup + Google Form workflow
│
├── assets/
│   ├── css/
│   │   ├── style.css              Base site styling
│   │   └── modal.css              Modal + profile page styling
│   └── js/
│       ├── students-data.js       ⭐ SINGLE SOURCE OF TRUTH for all students
│       ├── personal-details.generated.js   AUTO-GENERATED — do not hand-edit
│       ├── form-config.js         Google Form URL + prefill config
│       ├── gallery.js             Renders the grid, handles search, opens modal
│       ├── modal.js               Reusable modal component
│       └── app.js                 Tiny entry point for index.html
│
├── data/
│   ├── Class Gallery.csv          Real Google Form export
│   ├── responses.sample.csv       Example/reference CSV format
│   └── desktop.ini                (Windows OS file, ignore)
│
├── tools/
│   ├── build-personal-details.js  Node script: CSV → personal-details.generated.js
│   ├── student-index.js           Helper: exposes [id, name] pairs for matching
│   └── debug-match.js             Scratch script for testing name-matching logic
│
├── pics/                          Student photos (WhatsApp exports)
└── class mate 0xx.jpg             A few root-level student photos
```

## 3. How a page loads (read this first)

Open `index.html` and follow the trail — it's short:

1. `index.html` has one script tag:
   `<script type="module" src="./assets/js/app.js"></script>`
   `type="module"` means the browser understands `import`/`export`
   natively. No bundler (Webpack/Vite/etc.) is involved anywhere.

2. `app.js` is intentionally almost empty:
   ```js
   import { initGallery } from './gallery.js';
   initGallery();
   ```

3. `gallery.js` does the real work:
   - imports the `students` array and `searchStudents()` from
     `students-data.js`
   - builds one `<div class="student-card">` per student and injects
     them into `#studentGallery`
   - attaches **one** click listener to the whole grid (not one per
     card — see §7 "Event delegation") that opens the modal
   - wires the search box: on every keystroke it re-filters `students`
     and re-renders
   - on load, checks the URL for `?student=5` and opens that student's
     modal automatically (deep-link support)

4. `modal.js` builds a single modal `<div>` once, then just swaps its
   text/image content in and out on each click — it never rebuilds the
   DOM from scratch. It also handles: closing on outside-click, closing
   on `Esc`, focus management (accessibility), and keeping the URL in
   sync via `history.pushState` so the browser back button closes the
   modal correctly.

`portfolio.html` and `classmates_all.html` are simpler — each has its
own inline `<script type="module">` that imports directly from
`students-data.js` and renders straight into the page. They don't go
through `gallery.js`/`modal.js` because they don't need search or a
popup — they render everything at once.

## 4. `students-data.js` — the core module

This is the file you'll touch most. Structure, top to bottom:

| Section | What it is |
|---|---|
| `TOTAL_STUDENTS` | `120` — controls how many student records get generated, even for ids with no name yet (they become `"Student 42"` placeholders) |
| `NAMES`, `IMAGES`, `EMAILS` | Plain objects keyed by numeric `id`. **This is what you edit** to add/fix a student. |
| `SCIENCE_STREAM` | A `Set` of ids used by `courseFor()` to decide "Sciences" vs "General Studies" |
| `personalDetailsFor(id)` | Pulls a student's "In Their Own Words" answers from `PERSONAL_DETAILS` (imported from the auto-generated file). Falls back to `"Not shared yet"` per-field if missing. |
| `sortStudentsForDisplay(list)` | Sorts: students **with** a portfolio (`hasPortfolio === true`) first, alphabetically; students without one after, also alphabetically. |
| `rawStudents` | Builds the full array of student objects, one per id `0..119`, unsorted (id order) |
| `students` (exported) | `sortStudentsForDisplay(rawStudents)` — the actual array every other file imports. **Always import `students` from here, never build your own list.** |
| `getStudentById(id)` | O(1) lookup via a `Map` built once from `students` |
| `searchStudents(query)` | Case-insensitive substring filter on `name` |

**To add or fix a student:** just edit `NAMES[id]`, `IMAGES[id]`,
`EMAILS[id]` near the top of the file. Everything downstream (gallery
card, search, modal, portfolio page, classmates grid) updates
automatically — no other file needs touching.

## 5. Rendering pattern used everywhere

Every page follows the same simple pattern — worth internalizing since
you'll reuse it:

```js
import { students } from './assets/js/students-data.js';

container.innerHTML = students.map(studentToHTML).join('');
```

i.e. **map data → HTML strings → join → set `innerHTML` once.** This
is simpler than a framework's virtual DOM, but it means: if you need
to re-render after a change (like the search box does), you regenerate
the *whole* list's HTML and replace it in one go — for ~120 students
this is fast enough that you don't need anything fancier.

## 6. The personal-details pipeline (CSV → JS)

This is the part that surprises newcomers most, so pay attention.

`assets/js/personal-details.generated.js` is a **build artifact** —
never hand-edit it, your changes will be silently overwritten. It's
regenerated by running:

```
node tools/build-personal-details.js
```

What happens when you run it:

1. It reads every `.csv` file in `data/` (or specific files if you
   pass paths as arguments).
2. For each response row, it tries to figure out **which student id**
   the row belongs to:
   - First choice: a `Student ID` column, if the form used a
     pre-filled link (see `README.md` §"Setting up pre-filled links").
     This is exact and typo-proof.
   - Fallback: fuzzy-matches the typed name against
     `students-data.js` names — handles reversed word order, accents,
     punctuation, and a small hardcoded list of known misspellings
     (`tokenVariants` — e.g. `eric`/`erik`, `maryam`/`mariam`).
3. It writes out `PERSONAL_DETAILS = { <id>: {...}, ... }` to
   `personal-details.generated.js`.
4. It prints a summary: how many matched, and lists anyone it
   *couldn't* match (so you can fix a name spelling and re-run).

`tools/student-index.js` is a small helper the build script uses — it
just re-exports `[id, name]` pairs from `students-data.js`, filtering
out placeholder `"Student N"` names so they can't accidentally
fuzzy-match a real response.

`tools/debug-match.js` is a scratch/debugging script for testing the
name-matching logic in isolation on a couple of hardcoded example
names — useful if the build script reports an unexpected unmatched or
ambiguous name and you want to step through why.

**You will re-run `build-personal-details.js` any time new form
responses come in.** It's idempotent — safe to run repeatedly.

## 7. A few deliberate design choices (and why)

- **Event delegation** (`gallery.js`): one `click` listener on the
  grid container, not one per card. New cards (from search re-render)
  automatically work with zero extra listeners — better performance,
  less code, no memory leaks from forgotten listeners.
- **Modal built once, reused** (`modal.js`): avoids recreating the
  modal DOM structure on every click; only text/`src` attributes are
  updated.
- **`Map` for `getStudentById`**: O(1) instead of `students.find(...)`
  which would be O(n) on every modal open.
- **No build step / no framework**: you can deploy this by copying the
  folder to any static host (GitHub Pages, Netlify, or even a school
  server) — nothing to compile.
- **Deep links** (`?student=5`): both `index.html` (opens modal) and
  `portfolio.html` (full page) respect this, so links to individual
  students are shareable and bookmarkable.

## 8. Common tasks, step by step

**Add a new student:**
1. Open `assets/js/students-data.js`.
2. Add entries to `NAMES[id]`, `IMAGES[id]`, and optionally
   `EMAILS[id]`.
3. Add their photo file to `pics/` (or project root) matching the path
   you used in `IMAGES`.
4. Refresh the page. Done — no other file changes needed.

**Fix a typo in a name:**
Same file, same objects. If they've already submitted form responses,
also re-run `node tools/build-personal-details.js` afterward so the
name-matcher picks up the corrected spelling.

**Bring in new Google Form responses:**
1. Export the Google Sheet as CSV into `data/`.
2. Run `node tools/build-personal-details.js`.
3. Check the console output for unmatched/ambiguous names and fix
   spellings in `students-data.js` if needed, then re-run.

**Change what "first" means in the gallery ordering:**
Edit `sortStudentsForDisplay()` in `students-data.js` — it's the only
place display order is decided, and it's used regardless of which
page renders `students`.

**Style changes:**
`assets/css/style.css` for general site styling, `assets/css/modal.css`
for the modal/profile-card look.

## 9. Things NOT to do

- ❌ Don't hand-edit `personal-details.generated.js` — it gets
  overwritten by the build script.
- ❌ Don't add a student's name/photo/email directly inside an
  `.html` file — always go through `students-data.js`.
- ❌ Don't build a second array of students anywhere — always
  `import { students } from './students-data.js'`.
- ❌ Don't commit real `FORM_BASE_URL`/`ID_ENTRY_FIELD` values to a
  public repo if the form should stay private to your class — check
  `form-config.js` before publishing.

## 10. Quick glossary (for junior devs newer to JS)

- **ES module** (`type="module"`, `import`/`export`): the browser's
  built-in way to split code into files, no bundler required.
- **Event delegation**: attaching a listener to a parent element and
  checking `e.target` instead of listening on every child — fewer
  listeners, works automatically for elements added later.
- **`Map`**: like an object but built for fast key→value lookups; here
  used for `id → student`.
- **Template literal** (`` `...${x}...` ``): JS's way to build strings
  with embedded variables — used everywhere to build HTML strings.
- **`URLSearchParams`**: browser API for reading/writing `?key=value`
  query strings, used for the `?student=5` deep links.
- **`history.pushState`**: updates the URL bar without a full page
  reload — makes the modal's URL shareable and makes the back button
  work.
