# Divine Motivation — PWA

**Find Your Strength. Trust Your Journey.**

A peaceful, distraction-free Progressive Web App for daily spiritual and motivational inspiration. Features Lord Krishna and Lord Shiva backgrounds, your personal motivation collection, and full offline support.

---

## Features

- **Home screen** with random motivational quotes over beautiful deity backgrounds
- **My Collection** — full CRUD for your own motivations (Add, Edit, Delete, View)
- **8 Categories** — Discipline, Success, Hard Work, Self Confidence, Life Lessons, Spirituality, Bhagavad Gita, Personal Thoughts
- **Favourites** — mark any quote as favourite, view them in a dedicated tab
- **New / Previous / Next** navigation with history
- **Copy** to clipboard, **Share** via native mobile sharing
- **Daily Inspiration** — opens to a fresh quote each day
- **Krishna / Shiva theme** switcher with rotating backgrounds
- **Category filter + search** in your collection
- **Offline support** — installable PWA, works fully offline after first load
- **Local-only storage** — your motivations never leave your device (LocalStorage). No accounts, no tracking, no cloud.
- **Export / Import** your motivations as a JSON backup file
- **Sample motivations included** — replace or delete them anytime

---

## Project Structure

```
divine-motivation/
├── index.html              # App shell + all views
├── style.css               # Spiritual theme (navy, saffron, gold)
├── script.js               # All app logic, LocalStorage, PWA features
├── manifest.webmanifest    # PWA manifest
├── service-worker.js       # Offline caching
├── icons/
│   ├── icon-192.png        # Standard icon
│   ├── icon-512.png        # High-res icon
│   ├── maskable-192.png    # Adaptive icon (Android)
│   ├── maskable-512.png    # Adaptive icon (Android)
│   ├── apple-touch-icon.png# iOS home screen icon
│   └── favicon.ico         # Browser tab icon
├── images/
│   ├── krishna-flute.jpg
│   ├── krishna-aura.jpg
│   ├── krishna-crown.jpg
│   ├── krishna-peacock.jpg
│   ├── shiva-meditation.jpg
│   ├── shiva-himalaya.jpg
│   ├── shiva-trident.jpg
│   └── shiva-kailash.jpg
└── README.md               # This file
```

---

## Run Locally (for development / testing)

A simple static server is enough. From inside the `divine-motivation/` folder:

```bash
# Option 1: Python 3
python3 -m http.server 8080

# Option 2: Node (npx)
npx serve .

# Option 3: VS Code Live Server extension
```

Then open <http://localhost:8080> in your browser.

> **Note:** The service worker only registers over `http(s)` — it will not register from `file://`. Use the local server above to test PWA features.

---

## Deploy — Step by Step

Pick any one of the three options below. All three are free and work for static PWAs.

### Option A — GitHub Pages (free, recommended)

1. **Create a new GitHub repository** (e.g. `divine-motivation`).
2. **Upload the project files** to the repo. You can do this in one of these ways:
   - Drag-and-drop the entire `divine-motivation` folder contents into the GitHub web upload page, **or**
   - Use git:
     ```bash
     cd divine-motivation
     git init
     git add .
     git commit -m "Initial commit: Divine Motivation PWA"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/divine-motivation.git
     git push -u origin main
     ```
3. **Enable GitHub Pages:**
   - Go to your repo → **Settings** → **Pages** (left sidebar).
   - Under "Build and deployment":
     - Source: **Deploy from a branch**
     - Branch: **main** / **root** (or `/docs` if you put files in a `docs` folder)
     - Click **Save**.
4. Wait ~1 minute. Your app will be live at:
   `https://YOUR_USERNAME.github.io/divine-motivation/`

### Option B — Netlify (free, fastest)

1. Go to <https://app.netlify.com/drop>.
2. Drag the entire `divine-motivation` folder onto the page.
3. Done — Netlify gives you an instant HTTPS URL like `https://divine-motivation.netlify.app`.
4. (Optional) Pick a custom subdomain under **Site settings → Domain management**.

### Option C — Vercel (free)

1. Push the project to GitHub (see Option A, step 2).
2. Go to <https://vercel.com/new> and import the repo.
3. Framework preset: **Other** (it is a static site).
4. Click **Deploy**. Done — Vercel gives you `https://divine-motivation.vercel.app`.

> **Important for all three:** The app must be served over **HTTPS** for the service worker and "Add to Home Screen" to work. All three platforms above provide HTTPS by default.

---

## Install on Android

After deploying (or while testing on `localhost`):

1. Open the deployed URL in **Chrome** (or Edge / Brave) on your Android phone.
2. Wait for the page to fully load.
3. You will see one of two install prompts:
   - An **"Install app"** button may appear in the address bar / overflow menu (⋮), **or**
   - A small banner at the bottom: **"Add Divine to Home screen"**.
4. Tap **Install** (or **Add to Home screen**).
5. The app icon (a lotus/Om symbol on navy background) appears on your home screen.
6. Tap it — the app opens **full-screen, standalone, without browser bars**, just like a native app.

If you do not see the prompt:
- Open Chrome's overflow menu (⋮) → **Add to Home screen** → **Install**.
- Make sure Chrome is up to date.

### Uninstall
Long-press the home-screen icon → **Uninstall** (or **Remove**).

---

## Install on iOS (iPhone / iPad)

iOS supports PWAs via Safari:
1. Open the URL in **Safari**.
2. Tap the **Share** button (square with up arrow).
3. Tap **Add to Home Screen**.
4. Tap **Add**. The icon appears on your home screen.

> Note: iOS does not support the Web Share API's `navigator.share()` for text in older versions; on unsupported devices the Share button falls back to copying the quote to the clipboard.

---

## Keyboard Shortcuts (desktop / when bluetooth keyboard attached)

| Key | Action |
| --- | --- |
| `N` | New motivation |
| `←` | Previous |
| `→` | Next |
| `F` | Toggle favourite |
| `C` | Copy to clipboard |
| `S` | Share |
| `Esc` | Close modal / dialog |

---

## Data & Privacy

- All your motivations are stored in the browser's **LocalStorage** on the device you used to add them.
- They are **not** synced to any server. Each device/browser has its own collection.
- Use **Settings → Export to file** to back up. Use **Import from file** to restore on another device.
- **Clearing browser data / site data** will erase your motivations — export first if you want to keep them.

---

## Customizing

### Change background images
Replace the files in `images/` with your own (keep the same filenames, or update the `BG_IMAGES` object in `script.js`).

### Change the lotus icon
Edit `scripts/generate_icons.py` (in the source repo) and re-run, or replace the PNGs in `icons/` directly.

### Change theme colors
Edit the CSS custom properties at the top of `style.css`:
```css
:root {
  --navy: #0F172A;
  --saffron: #FF9933;
  --gold: #DAA520;
  /* ...etc */
}
```

### Add / edit sample motivations
Edit the `SAMPLE_MOTIVATIONS` array at the top of `script.js`. New installs / "Reset to sample data" will use these.

### Add a new category
1. Add it to the `CATEGORIES` array in `script.js`.
2. Add an `<option>` to every `<select id="...Category">` in `index.html` (filter, modal, etc.).

---

## Browser Support

- **Chrome / Edge / Brave (Android, desktop)** — fully supported, installable PWA.
- **Firefox (Android, desktop)** — fully supported; PWA install via "Add to Home Screen" in newer versions.
- **Safari (iOS 16.4+)** — installable PWA via "Add to Home Screen"; service worker supported.
- **Samsung Internet** — fully supported, installable.

---

## Tech Stack

- HTML5
- CSS3 (custom properties, flexbox, gradients, backdrop-filter)
- Vanilla JavaScript (no framework, no dependencies)
- Web Storage API (LocalStorage)
- Web Share API
- Service Workers + Cache API
- Web App Manifest

No build step. No bundlers. No npm install. Just open and use.

---

## Credits

- Background images of Lord Krishna and Lord Shiva: sourced from royalty-free image providers via web image search. Replace them with your own licensed images if you plan to publish commercially.
- Fonts: *Cormorant Garamond* (quotes) and *Inter* (UI) — both via Google Fonts (open license).
- App icon: original design (lotus + Om motif), generated with Pillow.

---

Om Namah Shivaya. Hare Krishna. 🙏

*Stay Focused. Stay Positive. Trust the Divine.*
