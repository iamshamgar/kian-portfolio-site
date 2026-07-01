# CLAUDE.md — Kian's Architecture Portfolio

## What this is
The personal portfolio website of **Kian**, an undergraduate architecture student. Kian is the owner and the person talking to you. **Kian is not a developer.** Explain everything you do in plain language. Never assume he knows git, JavaScript, or the terminal. When something goes wrong, say what happened and what you're doing about it — no jargon without a one-line translation.

## How the site works
- Pure static site: HTML + CSS + vanilla JS. **No build step.** It must always work by double-clicking `index.html`.
- **All content lives in one file: `data/projects.js`** — a `student` block (name, bio, contacts) at the top and a `projects` array below it.
- Images live in `images/projects/<id>/`, numbered `01.jpg`, `02.jpg`, `03.jpg`, ... (`.png`/`.webp` also fine). **The folder name must exactly match the project's `id`.** The first image (`01`) is the cover shown on the grid.
- Profile photo: `images/profile/photo.jpg`, path referenced in `student.profileImage`.
- `admin.html` + `js/admin.js` + `css/admin.css` are a visual editor Kian sometimes uses instead of you. It edits the same `data/projects.js`. It must keep working.

## Hard constraints — do not violate
- **No build tools, no frameworks, no package managers.** No npm, no bundlers, no React, ever. If Kian asks for a feature that seems to need one, find the vanilla way or explain the tradeoff first.
- Do **not** restructure `js/main.js`, `css/style.css`, or `index.html` unless Kian explicitly asks for a design/behavior change.
- Do **not** break `admin.html`/`js/admin.js`/`css/admin.css`. If you change the shape of the data in `projects.js`, the editor must still read and write it.
- Never rename or renumber existing image files unless asked.

## Adding a project (the most common request)
1. Pick an `id`: lowercase, hyphens, no spaces (e.g. `threshold-house`).
2. Create `images/projects/<id>/` and copy Kian's images in, renamed to `01.jpg`, `02.jpg`, ... in the order he wants (ask which should be the cover if unclear).
3. Append a well-formed block to the `projects` array in `data/projects.js` — copy the shape of an existing project: `id`, `title`, `subtitle`, `description`, `tags`, `images` (full paths), `video` (`""` if none), `featured`, `year`. Watch the commas between blocks.
4. Verify the file still parses (e.g. `node --check data/projects.js`, or careful review if node is unavailable) and that every listed image path exists.
5. Tell Kian it's done and to refresh `index.html` to see it.

## "Publish" / "save my changes"
When Kian says publish, save, or anything similar, pick the route that's actually set up — check in this order:

**Route 1 — GitHub (if `git remote -v` shows an `origin` remote):**
1. `git add -A`
2. `git commit -m "<short plain-English description, e.g. Add Threshold House project>"`
3. `git push`
4. Confirm in plain language: "Saved and published — the live site updates in about a minute."

If push fails (offline, sign-in needed), say so simply and tell him his work is safely saved on the laptop and will publish next time.

**Route 2 — Netlify CLI (no git remote, but the folder is Netlify-linked: `.netlify/state.json` exists or `netlify status` succeeds):**
1. `netlify deploy --prod --dir . --no-build`
2. Confirm in plain language: "Published — your live site is updated now," and include the live URL from the deploy output.

If the deploy fails (offline, login expired), say so simply: his work is safely saved on the laptop (and syncs to Google Drive automatically); try publishing again later, or run `netlify login` if it asks him to sign in.

**Neither?** Don't guess or run anything. Tell Kian in plain language: "Your changes are saved on the laptop, but this folder isn't hooked up to publishing yet — that's a one-time setup step. Check the setup sheet from your dad (Part C of the laptop setup guide), or ask him to do it with you."
