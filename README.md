# ✨ Anshika's 19th Birthday Website (`ANSHIKA.EXE`)

A personal, highly interactive, CS-themed birthday website built by **Anuj** for **Anshika** on her 19th birthday (28 October 2026).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

---

## 🚀 Live Demo & Quick Start

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

---

## 🎮 Interactive Journey Highlights

1. **Terminal Boot Sequence (`ANSHIKA.EXE`)**:
   - Progressive boot sequence with typewriter animation, step-by-step progress bar (0% -> 100%), synthesized terminal blip sound effect, and particle burst upon clicking **`[ ENTER EXPERIENCE ]`**.

2. **Cinematic Hero Reveal & Version 19.0 Upgrade**:
   - Staggered word reveal: `Happy` ↓ `19th` ↓ `Birthday,` ↓ `Anshika`.
   - Real-time digital upgrade badge: `VERSION 18.0` → `Updating to 19.0...` → `19.0 STATUS: STABLE`.
   - Starfield particle canvas and looping scroll indicator.

3. **Persistent Music Player with Dancing Waveform Equalizer**:
   - 4-band audio waveform equalizer that bounces **only while music is playing**.
   - Scrubbable progress bar, volume control, mute, track details.
   - Dual audio engine: pre-bundled with local soundtrack and an offline-safe Web Audio ambient synth fallback.

4. **Progressive Photo Gallery & Digital Memory Wall**:
   - Simulated progressive memory compiler bar (`10%` → `35%` → `68%` → `100%`).
   - One-by-one photo reveal upon scrolling.
   - Mix of tilted Polaroid cards and modern frosted glass cards.
   - Lightbox modal with next/prev buttons, touch swipe support, and captions.

5. **CS Developer Mini-Game ("Debugging Anshika's Birthday")**:
   - Interactive bug fixing console:
     - **Bug #001**: *"Birthday girl is getting older"* → `[ FIX BUG ]` → *"Age updated: 19."*
     - **Bug #002**: *"Insufficient happiness detected"* → `[ DEBUG ]` → *"Happiness restored to MAX."*
     - **Bug #003**: *"Caffeine running low"* → `[ REFILL CAFFEINE ]` → *"Refilled for Semester 4."*
     - **Bug #004**: *"Infinite loop of good vibes"* → `[ LET IT RUN ]` → *"Intentional design: will never terminate."*
   - Live patch progress tracker triggering celebratory particles when all 4 are resolved.

6. **Playful Secret "DON'T CLICK THIS ⚠️" Button**:
   - Multi-stage interactive micro-experience with dynamic dialogue and an achievement reward message.

7. **Encrypted Memory Timeline (Lock & Compile)**:
   - Git-commit history timeline where memories start in an encrypted state.
   - Clicking any memory triggers a simulated decryption compiling animation before revealing the moment and photo.
   - Includes a convenient `[ Compile All Memories ]` option.

8. **Hidden Developer Easter Egg (CLI & Konami Code)**:
   - Desktop shortcut: press **`↑ ↑ ↓ ↓ ← → ← →`** to unlock developer mode instantly.
   - Mobile shortcut: click the **`dev.sh`** icon in the navbar 5 times.
   - Command: `sudo birthday --wish` → *"May your code compile on the first try."*
   - Also supports: `help`, `cat note.txt`, `whoami`, `clear`, `exit`.

9. **Cinematic Final Message Compilation & Replay**:
   - Darkens screen and simulates a multi-step compilation (`10%` → `37%` → `64%` → `89%` → `100%`).
   - Reveals the grand birthday message and signature.
   - **`[ Run the experience again ]`** button resets the journey back to the boot terminal.

---

## 🛠️ How to Customize Everything

All personal details, messages, timeline events, and qualities are stored inside a single configuration file:
👉 **[`data/birthday.ts`](./data/birthday.ts)**

You do **not** need to touch any component code to customize the site!

---

### 1. 📸 Adding Her Real Photos

1. Place your 5 photos into `public/photos/`:
   - `public/photos/photo1.jpg`
   - `public/photos/photo2.jpg`
   - `public/photos/photo3.jpg`
   - `public/photos/photo4.jpg`
   - `public/photos/photo5.jpg`

2. Open [`data/birthday.ts`](./data/birthday.ts) and edit the captions and tags in the `photos` array.

---

### 2. 🎵 Adding / Changing the Music

1. Place your MP3 file into `public/music/` (e.g. `public/music/song.mp3`).
2. Open [`data/birthday.ts`](./data/birthday.ts) and update the `music` section:
   ```ts
   music: {
     title: "Song Name",
     artist: "Artist Name",
     src: "/music/song.mp3",
   }
   ```

---

### 3. ✍️ Editing the Birthday Message

Open [`data/birthday.ts`](./data/birthday.ts) and edit the `message.content` array:
```ts
message: {
  title: "A little message",
  codeComment: "// personal_note.ts (Compiled with care)",
  content: [
    "Happy Birthday, Anshika.",
    "...",
  ],
}
```

---

### 4. 🗓️ Editing Memories & Timeline

Open [`data/birthday.ts`](./data/birthday.ts) and edit the `timeline` array.

---

### 5. 💡 Editing Qualities & Attributes

Open [`data/birthday.ts`](./data/birthday.ts) and edit the `qualities` array.

---

### 6. 🖼️ Adding Custom GIFs

Drop any GIF files into `public/gifs/`:
- `public/gifs/celebrate.gif`
- `public/gifs/coding.gif`
- `public/gifs/reaction.gif`
*(If no custom GIF is placed, high-quality animated vector illustrations are displayed automatically!)*

---

## 🚢 Deploying to Vercel (Production Ready)

### Method A: Deploy via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete interactive 19th birthday experience"
   git branch -M main
   git remote add origin https://github.com/your-username/anshika-19.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** -> **"Project"**.
4. Import your `anshika-19` repository.
5. Click **"Deploy"**.

### Method B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

*Designed & developed by Anuj for Anshika • 19th Birthday • 28 October 2026*
