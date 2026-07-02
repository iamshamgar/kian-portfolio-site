# Setting Up Your Portfolio on Windows

One-time setup, about 30–40 minutes. After this, updating and publishing your site takes less than 5 minutes and is entirely point-and-click.

There are two short moments where you hand things off to your dad. Everything else is yours to do.

---

## Part 1 — Create Your GitHub Account

GitHub is the free service that hosts your site and saves every version of it. You need your own account — this is yours, not your dad's.

1. Go to [github.com/signup](https://github.com/signup).
2. Enter your email address and create a password.
3. **Choose your username carefully.** It will be part of your site's address (e.g., `kianliao.github.io`), so something that looks like your name is ideal. You can't easily change it later.
4. Verify your email when GitHub sends you a confirmation.

**Once you have your username: tell your dad.** He needs it for the next step — this is the hand-off moment.

---

## Part 2 — Dad's Step (~ 2 minutes)

*Kian, hand the laptop or just tell your dad your GitHub username. He'll do this part.*

Your dad transfers the portfolio repo from his GitHub account to yours. Once transferred, the repo is entirely yours — your dad can still see it but no longer owns it.

**Dad:** go to [github.com/iamshamgar/kian-portfolio-site/settings](https://github.com/iamshamgar/kian-portfolio-site/settings), scroll to the bottom (Danger Zone) → **Transfer** → type the repo name to confirm → enter Kian's GitHub username as the new owner → confirm. GitHub will send Kian an email to accept the transfer.

**Kian:** check your email and click **Accept transfer**. The repo now lives at `https://github.com/KIANS-USERNAME/kian-portfolio-site`.

---

## Part 3 — Install Git for Windows

1. Go to [git-scm.com/download/win](https://git-scm.com/download/win) — the download starts automatically.
2. Run the installer. **The default settings on every screen are fine** — just keep clicking Next, then Install, then Finish.

### Tell Git your name and email

Press the **Windows key**, type `powershell`, press Enter. A blue window opens. Copy and paste these two lines one at a time — replace the name and email with yours:

```powershell
git config --global user.name "Kian Liao"
git config --global user.email "your-github-email@example.com"
```

Use the same email as your GitHub account. Press Enter after each line. Then close the window.

---

## Part 4 — Download the Portfolio to Your Laptop

Open a new PowerShell window (Windows key → `powershell` → Enter). Run:

```powershell
cd ~\Documents
git clone https://github.com/KIANS-USERNAME/kian-portfolio-site.git
```

Replace `KIANS-USERNAME` with your actual GitHub username. A pop-up will ask you to sign in to GitHub — sign in once and it remembers you.

When it finishes, there will be a folder called `kian-portfolio-site` inside your Documents. That folder **is** your website — all the files that make it up, plus a hidden history of every version you've ever published.

Verify it worked:

```powershell
cd ~\Documents\kian-portfolio-site
git status
```

You should see `On branch main` and `nothing to commit`. If you do, you're all set.

---

## Part 5 — Turn On GitHub Pages (This Makes the Site Go Live)

GitHub Pages is the free hosting that turns your repo into a real website.

1. Go to your repo on GitHub: `https://github.com/KIANS-USERNAME/kian-portfolio-site`
2. Click **Settings** (top tab bar) → then **Pages** in the left sidebar (under "Code and automation").
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, pick **main** and **/ (root)**, then click **Save**.
5. Wait about 2 minutes, then refresh the page. A URL appears at the top of the Pages settings — that's your live site: `https://KIANS-USERNAME.github.io/kian-portfolio-site/`

Click it and you'll see the site.

---

## Part 6 — Connect kianliao.com to Your Site

Right now your site lives at a long GitHub address. This part makes it live at **kianliao.com** instead. It takes about 10 minutes of clicking, then a waiting period of up to a few hours while the internet catches up.

There's a second dad hand-off here — it's a 2-minute task in the Cloudflare account where the domain was purchased.

### Step 1: Tell GitHub about your domain

1. Go to your repo on GitHub → **Settings** → **Pages** (left sidebar).
2. Under **Custom domain**, type `kianliao.com` and click **Save**.
3. GitHub automatically adds a file called `CNAME` to your repo. Leave it alone — it's how GitHub remembers which domain belongs to your site.

### Step 2 — Dad's step: add DNS records in Cloudflare (~ 2 minutes)

*Kian: hand this to your dad. He logs into the Cloudflare account where kianliao.com was registered.*

**Dad:** log into [dash.cloudflare.com](https://dash.cloudflare.com), click **kianliao.com**, then **DNS → Records**. Add these five records:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `@` | `185.199.108.153` | DNS only (grey) |
| A | `@` | `185.199.109.153` | DNS only (grey) |
| A | `@` | `185.199.110.153` | DNS only (grey) |
| A | `@` | `185.199.111.153` | DNS only (grey) |
| CNAME | `www` | `KIANS-USERNAME.github.io` | DNS only (grey) |

Replace `KIANS-USERNAME` with Kian's actual GitHub username in the CNAME row.

> **The grey cloud is critical.** Every record must be set to **DNS only** (grey cloud icon), not **Proxied** (orange cloud). With the orange cloud on, GitHub can't verify the domain or issue the HTTPS certificate — the site won't connect. Click the orange cloud to toggle it grey before saving each record.

### Step 3: Wait, then enable HTTPS

Back on the GitHub Pages settings page:

1. Refresh every few minutes. When DNS is verified, a green checkmark appears next to `kianliao.com`. This usually takes a few minutes but can take up to a few hours.
2. Once the **Enforce HTTPS** checkbox becomes clickable, tick it. (It may take up to 24 hours to appear — GitHub is issuing a security certificate. Usually much faster.)

When both steps are done, `https://kianliao.com` is live and `www.kianliao.com` redirects there. The old `github.io` address redirects there too — nothing breaks.

### Step 4: Sync the CNAME file to your laptop

GitHub added a `CNAME` file to your repo in Step 1. Pull it down so your local copy stays in sync:

Open PowerShell and run:

```powershell
cd ~\Documents\kian-portfolio-site
git pull
```

Done. From this point on `publish.bat` still works exactly the same — nothing about publishing changes.

---

## Part 7 — Your Day-to-Day Workflow

### Editing your portfolio

1. Open **File Explorer** → `Documents\kian-portfolio-site`.
2. Right-click `admin.html` → **Open with** → **Microsoft Edge** (or Chrome).
3. Click **"Open my portfolio folder"** and pick the `kian-portfolio-site` folder. Say yes when the browser asks for permission to access your files.
4. Make your changes:
   - **Projects tab** — add a new project, edit an existing one, drag in images, reorder
   - **My Info tab** — update your name, bio, school, contact info, profile photo
5. Every save writes directly to your local files. To preview, open `index.html` in the same folder — it shows exactly what the live site will look like.

> **Edge works best.** It supports saving files directly from the editor. Chrome works too. Safari and Firefox use a "guided mode" that's less convenient.

### Publishing (sending changes to the live site)

When you're ready to go live:

1. Open `Documents\kian-portfolio-site` in File Explorer.
2. Double-click **`publish.bat`**.
3. A window opens, shows progress, and says **"Done!"** when finished.
4. Wait about 1 minute, then refresh your live site — your changes are there.

No terminal. No commands to remember.

---

## Your Live Site

**`https://kianliao.com`**

*(Before Part 6 is complete, the site is at `https://KIANS-USERNAME.github.io/kian-portfolio-site/` instead.)*

---

## Troubleshooting

**"Git is not installed or not found" when I double-click publish.bat**
Re-run the Git for Windows installer. On the screen that says "Adjusting your PATH environment," make sure **"Git from the command line and also from 3rd-party software"** is selected.

**"Authentication failed" or "Permission denied" when publishing**
Git forgot your GitHub login. Run this in PowerShell — it opens a browser sign-in:
```powershell
git credential-manager github login
```

**My changes saved in the editor but the live site didn't update**
Make sure you ran `publish.bat` after editing. The editor saves to your local files only — publish.bat is what sends them to GitHub and makes them live.

**The editor says "I couldn't find data/projects.js"**
You picked the wrong folder. Click "Open my portfolio folder" again and pick `Documents\kian-portfolio-site` — the folder that contains `index.html`.

**I want to undo a change**
Open PowerShell, go to the portfolio folder, and run:
```powershell
git log --oneline
```
This shows a list of past versions with short codes like `a1b2c3`. To restore one file from a past version:
```powershell
git checkout a1b2c3 -- data/projects.js
```
Then run `publish.bat` to put that version back on the live site.
