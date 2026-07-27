# Seylek CTY College — Class Gallery

## What changed

**Before:** student data (names, images, courses, emails) was typed out
separately inside `index.html`, `portfolio.html`, and `classmates_all.html`.
Adding or fixing a student meant editing the same information in up to
three places, and clicking a card navigated to a whole new page.

**Now:**
- All student data lives in **one file**: `assets/js/students-data.js`.
- Every other file *reads* from that one file — nothing is duplicated.
- Clicking a student opens a **modal** in place (no page reload), and
  still supports a shareable deep link like `index.html?student=5`.

## Folder structure

```
school-album/
├── index.html                 gallery + search + modal (main page)
├── portfolio.html              standalone profile page (deep-link fallback)
├── classmates_all.html         simple grid of every photo
├── assets/
│   ├── css/
│   │   ├── style.css           your original styles (unchanged)
│   │   └── modal.css           new: styles for the profile modal
│   └── js/
│       ├── students-data.js    ⭐ single source of truth for all student data
│       ├── modal.js            reusable modal component (open/close/focus/Esc)
│       ├── gallery.js          renders cards, handles search, opens modal on click
│       └── app.js              tiny entry point that starts the gallery
├── pics/                       your existing photos — copy your pics folder here
└── class mate 001.jpg ...      your existing root-level photos — copy them here too
```

## Adding or editing a student

Open `assets/js/students-data.js` and edit the three lookup objects near
the top:

```js
NAMES[12]  = 'ADISA ABDULSALAM';
IMAGES[12] = './pics/some-photo.jpg';
EMAILS[12] = 'someone@example.com';
```

That's it — the gallery, search, modal, and the two extra pages all pick
up the change automatically. No other file needs touching.

## Why this is scalable & fast

- **No duplication** — one data module feeds every page, so the site
  can never show inconsistent info for the same student.
- **Event delegation** — the gallery attaches *one* click listener to
  the grid instead of one per card, so it stays fast even with hundreds
  of students.
- **`Map` lookup** by id (`getStudentById`) is O(1), not a linear scan.
- **ES modules** (`type="module"`) — native, modern browser JavaScript.
  No build step, no npm install, no framework — just drop the files on
  any static host (GitHub Pages, Netlify, or a plain folder) and it
  works.
- **Modal is built once** and its content is swapped per click, instead
  of re-creating DOM each time.

## Adding the SS3 personal details (via Google Form) — no copy-pasting

You never hand-type the 39 (or 120) students' answers. The flow is:
**Google Form → Google Sheet → export CSV → run one script → done.**

### 1. Build the Google Form
Ask for exactly these questions (question titles matter — the script
matches on them):
- **Student ID** *(short answer — students never type this themselves, see below)*
- **Full Name**
- Who is your best friend in class?
- What is your best subject?
- What is your motivational quote?
- What do you want to study in university?
- Which teacher will you miss the most?
- What will you miss most about Seylek?

Link the form to a new Google Sheet (Form → Responses tab → green
Sheets icon).

### 2. Setting up pre-filled links (students never see or type an ID)

1. Open your form → click the **Send** button → click the **`<>`**
   (embed/link) icon → **"Get pre-filled link"**.
2. It opens a copy of the form. Type any placeholder into "Student ID"
   (e.g. `0`) and leave everything else blank, then click **Get link**.
3. Google gives you a URL like:
   `https://docs.google.com/forms/d/e/1FAI.../viewform?usp=pp_url&entry.184730291=0`
   Two pieces matter:
   - the part before `?usp=pp_url` — that's your `FORM_BASE_URL`
   - `entry.184730291` — that's your `ID_ENTRY_FIELD`
4. Open `assets/js/form-config.js` and paste both values in:
   ```js
   export const FORM_BASE_URL = 'https://docs.google.com/forms/d/e/1FAI.../viewform';
   export const ID_ENTRY_FIELD = 'entry.184730291';
   ```
5. Save. Every student's modal (and their `portfolio.html` page) now
   shows a **"Fill In Your Yearbook Info →"** button that opens the
   form with their `id` already filled in — invisibly, automatically,
   using the same `id` already sitting in `students-data.js`. They
   just click it and answer the real questions.

### How matching works when the CSV comes back
The build script checks the **Student ID** column first — since it
arrived pre-filled, it's an exact, typo-proof match straight to that
student's `id`. If a student used the plain (non-personalized) form
link and left that field blank, the script falls back to matching
their typed **Full Name** against `students-data.js` (case/spacing/
word-order-insensitive), and reports anyone it still couldn't match.

### 3. Export and sync
1. In the Google Sheet: **File → Download → Comma Separated Values (.csv)**.
2. Save it as `data/responses.csv` in this project (a sample showing
   the expected format is at `data/responses.sample.csv`).
3. Run:
   ```
   node tools/build-personal-details.js data/responses.csv
   ```
4. It regenerates `assets/js/personal-details.generated.js` and prints
   how many responses matched and lists any that didn't.
5. Refresh `index.html` — every matched student's modal now shows
   their answers. No install needed; the script only uses Node's
   built-in modules.

Re-run step 3 any time new responses come in (weekly, or once before
the yearbook is finalized) — it's one command, not 39 edits.

### If a student hasn't submitted yet
Their modal just shows "Not shared yet" for each field instead of
breaking — so you can publish the site before every response is in
and it fills in as more come.

## Next step for you

Copy your existing `pics/` folder and the root-level `class mate 0xx.jpg`
files into this new `school-album/` folder (same filenames, same
relative paths — nothing needs renaming). Then open `index.html`.
