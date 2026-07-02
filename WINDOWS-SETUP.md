# Setting Up Your Portfolio on Windows

One-time setup, about 20 minutes. After this, updating and publishing your site takes less than 5 minutes and is entirely point-and-click.

---

## Before You Start

Ask your dad to make sure these are done first:

- [ ] The portfolio repo is on GitHub and you have access to it
- [ ] You have the repo URL (looks like `https://github.com/USERNAME/kian-portfolio-site`)

---

## Part 1 — One-Time Setup

### Step 1: Create a GitHub account

Go to [github.com/signup](https://github.com/signup) and create a free account using your own email. Pick a username that looks professional — it may show up in your site's address.

Once you have an account, send your username to your dad so he can give you access to the portfolio repo.

### Step 2: Install Git for Windows

1. Go to [git-scm.com/download/win](https://git-scm.com/download/win) — the download starts automatically.
2. Run the installer. **The default settings on every screen are fine** — just keep clicking Next, then Install.
3. When it finishes, click Finish.

### Step 3: Tell Git your name and email

Press the **Windows key**, type `powershell`, and press Enter. A blue window opens. Copy and paste these two lines, one at a time, replacing the name and email with yours:

```powershell
git config --global user.name "Kian Liao"
git config --global user.email "your-email@example.com"
```

Use the same email as your GitHub account. Press Enter after each line. Then close the window.

### Step 4: Download the portfolio to your laptop

Open a new PowerShell window (Windows key → `powershell` → Enter). Run these two lines:

```powershell
cd ~\Documents
git clone https://github.com/USERNAME/kian-portfolio-site.git
```

Replace `https://github.com/USERNAME/kian-portfolio-site.git` with the actual repo URL your dad gave you.

A pop-up window will ask you to sign in to GitHub — sign in once and it remembers you. When it finishes, there will be a folder called `kian-portfolio-site` inside your Documents folder. That folder **is** your website.

### Step 5: Verify everything works

In that same PowerShell window:

```powershell
cd ~\Documents\kian-portfolio-site
git status
```

If you see `On branch main` and `nothing to commit`, you're all set.

---

## Part 2 — Your Day-to-Day Workflow

### Editing your portfolio

1. Open **File Explorer** and navigate to `Documents\kian-portfolio-site`.
2. Right-click `admin.html` → **Open with** → **Microsoft Edge** (or Chrome).
3. Click **"Open my portfolio folder"** and pick the `kian-portfolio-site` folder. Say yes when the browser asks permission to access your files.
4. Make your changes:
   - **Projects tab** — add a new project, edit an existing one, drag in images, reorder
   - **My Info tab** — update your name, bio, school, contact info, profile photo
5. Every save writes directly to your files. To preview, open `index.html` in Edge — it shows exactly what the live site will look like.

> **Edge works best** for the editor because it has the File System Access API that lets the editor save files directly to your folder. Chrome works too. Safari and Firefox will show a "guided mode" instead, which is less convenient.

### Publishing (sending changes to the live site)

When you're happy with your changes:

1. Open `Documents\kian-portfolio-site` in File Explorer.
2. Double-click **`publish.bat`**.
3. A black window opens, shows what it's doing, and says **"Done!"** when it's finished.
4. Wait about 1 minute, then refresh your live site — your changes are there.

That's it. No terminal commands to remember.

---

## Part 3 — Your Live Site

After setup, your site lives at:

**`https://iamshamgar.github.io/kian-portfolio-site/`**

*(This address will move to `kianliao.com` once the domain is connected — your dad is handling that.)*

---

## Troubleshooting

**"Git is not installed or not found" when I double-click publish.bat**
Git didn't get added to your PATH. Re-run the Git for Windows installer, and on the screen that says "Adjusting your PATH environment," make sure **"Git from the command line and also from 3rd-party software"** is selected.

**"remote: Permission denied" or "Authentication failed" when publishing**
Git forgot your GitHub login. Run this in PowerShell — it will open a browser sign-in:
```powershell
git credential-manager github login
```

**My changes saved in the editor but aren't showing on the live site**
Make sure you ran `publish.bat` after editing. The editor saves to your local files; publish.bat is what sends them to GitHub.

**The editor says "I couldn't find data/projects.js"**
You picked the wrong folder. Click "Open my portfolio folder" again and pick `Documents\kian-portfolio-site` — the folder that contains `index.html`.

**I accidentally deleted something and want it back**
Open PowerShell, navigate to the portfolio folder, and run:
```powershell
git log --oneline
```
This shows a list of saves with codes like `a1b2c3`. To go back to one, run:
```powershell
git checkout a1b2c3 -- data/projects.js
```
Replace `a1b2c3` with the code from the save you want to restore. Then run `publish.bat` to put that version back on the live site.
