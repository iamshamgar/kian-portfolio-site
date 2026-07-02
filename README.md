# Architecture Portfolio — How to Update Your Site

Welcome. This site now comes with its own **Portfolio Editor** — a visual editing page that lives right in this folder. You add projects and update your info through friendly forms; it handles all the file naming and folder wrangling for you. Everything stays on your own computer — nothing is uploaded anywhere.

---

## The Easy Way: The Portfolio Editor

**Open `admin.html` in Chrome or Edge** (double-click it, or right-click → Open With → Chrome).

1. Click **"Open my portfolio folder"** and pick this folder (the one with `index.html` in it). The browser will ask permission to save files there — say yes; that's how the editor writes your changes.
2. Use the **Projects** tab to add, edit, reorder, or delete projects. Drag your images straight into the form — the editor names them, files them into the right folder, and sets the cover image (the first one in the strip) automatically.
3. Use the **My Info** tab to update your name, bio, contact links, and profile photo.
4. Every save writes straight to your files. Refresh `index.html` and your changes are live.

**Using Safari or Firefox?** The editor still works, in *guided mode*: you fill in the same forms, and at the end it hands you the finished `projects.js` to download plus a short checklist of which image files to rename and where to put them. For one-click saving, though, Chrome or Edge is the way to go.

---

## 1. How to Add a New Project

1. Open `admin.html` in **Chrome** or **Edge**.
2. Click **"Open my portfolio folder"** and pick this folder.
3. In the **Projects** tab, click **"+ Add project"**.
4. Fill in the title, subtitle, description, tags, and year. Tick **Featured** to pin it near the top of the grid.
5. Drag your images into the drop zone. Use the arrows under each thumbnail to reorder — the **first image is the cover** shown on the grid.
6. Click **"Save project"** — done. Refresh `index.html` to see it.

(Prefer to edit files by hand, or curious what the editor does under the hood? See **Appendix: The Manual Way** at the bottom of this file.)

---

## 2. How to Update Your Bio or Contact Info

**Easy way:** open `admin.html` in Chrome or Edge → **My Info** tab → edit → **Save my info**.

**Manual way:** open `data/projects.js` and edit the `student` block at the very top:

```javascript
student: {
  name: "Your Full Name",
  tagline: "Architecture Student",
  school: "School of Architecture, University Name",
  year: "B.Arch, Class of 2027",
  bio: "Write your bio here...",
  email: "your.email@school.edu",
  linkedin: "https://linkedin.com/in/yourname",   // or leave as ""
  instagram: "https://instagram.com/yourhandle",  // or leave as ""
  profileImage: "images/profile/photo.jpg"
}
```

Leave `linkedin` or `instagram` as an empty string (`""`) to hide those links from the site.

---

## 3. Adding a Profile Photo

**Easy way:** open `admin.html` → **My Info** tab → **Choose a photo…** → **Save my info**. The editor files it away and updates the path for you.

**Manual way:** put your photo in `images/profile/` and name it `photo.jpg` (or update the path in `profileImage` to match whatever you named it).

The site automatically shows a placeholder if the photo file is missing or the path is wrong — so nothing will break.

---

## 4. Adding a Video

Paste the full YouTube or Vimeo URL into the `video` field of a project:

```javascript
video: "https://www.youtube.com/watch?v=YOURCODE"
```

A "Watch Video" button will appear in the project popup that opens the video in a new browser tab. Leave `video: ""` to hide the button.

---

## 5. How to Preview Locally

Double-click `index.html` to open it directly in your browser. No internet connection required (except for loading the Google Fonts, which is just the typography — the site still works without them).

Everything — filtering, the project popup, the image carousel — works on your local machine without any server.

---

## 6. Where the Site Lives Online

The site is hosted (for free) on **GitHub Pages** — it lives in a GitHub repository, and every time changes are pushed there, the live site updates itself within a minute or two. So "publishing" is just saving your changes and pushing (or asking Claude to *"save and publish my changes"* — it handles it).

The site's home address is **kianliao.com** (with a `KIANS-USERNAME.github.io/portfolio` address as the behind-the-scenes original). The one-time setup for all of this is in the laptop setup sheet from your dad — you don't need to redo any of it here.

*(Other free hosts exist — Netlify, Vercel — and this folder would work on any of them, but GitHub Pages is the one we use.)*

---

## 7. What NOT to Edit

You do not need to touch these files unless you want to change the visual design:

- `css/style.css` — controls all colors, fonts, spacing, and layout
- `js/main.js` — controls all site behavior
- `index.html` — the page structure
- `admin.html`, `js/admin.js`, `css/admin.css` — the Portfolio Editor itself

If something looks wrong after editing `projects.js`, the most common cause is a missing comma between project blocks, or a typo in an image path. JavaScript is picky about commas — every project block except the last one needs a comma after its closing `}`.

---

## Appendix: The Manual Way (if you're curious, or the editor won't open)

Everything the editor does, you can also do by hand. The site reads all of its content from **one file**: `data/projects.js`. Open it in any text editor (TextEdit, Notepad, VS Code — anything works). It has two sections:

1. **`student { ... }`** — your name, school, bio, and contact info
2. **`projects: [ ... ]`** — your project list

### Adding a project by hand

**Step 1: Add your images.** Create a folder for your project inside `images/projects/`. Name it something short and lowercase with no spaces:

```
images/projects/my-project-name/
```

Add your images to that folder and name them sequentially:

```
01.jpg
02.jpg
03.jpg
```

JPEG, PNG, and WebP all work fine. The first image (`01.jpg`) appears on the project grid.

**Step 2: Add a project block in `projects.js`.** Scroll to the `projects` array and copy-paste this block at the top (before the first existing project, inside the `[` brackets):

```javascript
{
  id: "my-project-name",
  title: "My Project Title",
  subtitle: "Studio Name — Semester Year",
  description: "Write a few sentences about the project here. What was the brief? What did you explore? What was the outcome?",
  tags: ["Tag One", "Tag Two"],
  images: [
    "images/projects/my-project-name/01.jpg",
    "images/projects/my-project-name/02.jpg",
    "images/projects/my-project-name/03.jpg"
  ],
  video: "",
  featured: true,
  year: "2025"
},
```

Fill in every field:

| Field | What to put |
|---|---|
| `id` | A unique identifier — lowercase, hyphens instead of spaces, no special characters. Must match your folder name exactly. |
| `title` | The project name as it appears on the site |
| `subtitle` | Course name + semester, e.g. `"Design Studio IV — Spring 2025"` |
| `description` | 2–4 sentences. This appears in the project popup. |
| `tags` | Categories used for the filter buttons. Keep them consistent across projects (e.g. always `"Residential"` not sometimes `"Residential"` and sometimes `"Housing"`). |
| `images` | List all your image paths. Must match exactly — capitalization matters. |
| `video` | YouTube or Vimeo URL, or leave as `""` to hide the video button. |
| `featured` | `true` pushes the project to the top of the grid. `false` puts it after featured projects. |
| `year` | The year the project was completed — used for display and sorting. |

**Step 3: Save and refresh.** Save `projects.js`, open `index.html` in your browser, and your new project appears.

If something looks wrong after a hand edit, the most common cause is a missing comma between project blocks, or a typo in an image path — JavaScript is picky about commas.
