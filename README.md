# ✨ Anshika's 19th Birthday Website (`ANSHIKA.EXE`)

A personal, highly interactive, playful CS-themed birthday website built by **Anuj** for **Anshika** on her 19th birthday (28 October 2026).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

---

## 🚀 Live Demo & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

---

## 🕹️ Interactive Story & Game Flow

The site is designed as an interactive journey:
$$\text{Discover} \longrightarrow \text{Click} \longrightarrow \text{Laugh} \longrightarrow \text{Explore} \longrightarrow \text{Surprise} \longrightarrow \text{Remember} \longrightarrow \text{Final Birthday Moment}$$

### Key Interactive Highlights:
1. **Playful Intro (`ANSHIKA.EXE`)**:
   - Terminal boot sequence with typewriter progress bar.
   - Detects an important person: *"Would you like to investigate?"* with `[ YES ]` vs `[ Obviously ]` options and witty responses (*"Good choice"* / *"I knew you'd click that"*).
   - Particle burst on `[ ENTER EXPERIENCE ]` initiating the background music.

2. **Cinematic Hero & Digital Version 19.0 Upgrade**:
   - Staggered word-by-word reveal: `Happy` ↓ `19th` ↓ `Birthday,` ↓ `Anshika`.
   - Real-time digital version upgrade badge (`18.0` → `Updating...` → `19.0 STATUS: STABLE`).

3. **"Choose Your Birthday Mode" (Funny Choices)**:
   - Interactive runtime cards: `[ CHAOS ]` (*"Expected."*), `[ PEACE ]` (*"Suspicious."*), `[ CAKE ]` (*"Correct answer."*).

4. **Conversational Scroll Interstitials**:
   - Pacing pauses throughout the scroll:
     - *"Okay, enough scrolling."* ... *"...actually keep going."*
     - *"You thought that was the end?"* ... *"Not even close."*
     - *"Okay, enough playing."* ... *"There's one thing I actually wanted to say..."*

5. **Discoverable Photo Wall**:
   - Photos start behind mystery cards: *"There's something behind this card..."*
   - Tapping reveals the photo and caption with full-screen lightbox zoom.

6. **Star Catcher Mini-Game (5-Second Reflex Calibration)**:
   - Catch 5 glowing golden sparks floating across the screen to score 100% on reflex metrics.

7. **CS Developer Mini-Game ("Debugging Anshika's Birthday")**:
   - Hotfix console with 4 interactive bugs (getting older, happiness levels, coffee depletion, infinite loops).

8. **Talks-Back Secret Button**:
   - `[ DON'T CLICK THIS ⚠️ ]` button with multi-stage reactive responses (*"Why did you click it? 😂"*, *"Are you inspecting the source code?"*) that awards a secret birthday note.

9. **Git Memory Decryption (Timeline)**:
   - Memories in the vertical timeline start encrypted. Clicking decrypts each memory, date, and milestone.

10. **Exploration Badge Counter (`Surprises: X/5`)**:
    - Subtle floating drawer tracking discoveries (*Officially Curious*, *Runtime Decider*, *Lightning Reflexes*, *Hotfix Engineer*, *Root Privilege*).

11. **Dual Easter Egg (Konami Code + Secret Terminal)**:
    - Press **`↑ ↑ ↓ ↓ ← → ← →`** anytime on desktop or click the **`dev.sh`** navbar icon 5 times.
    - CLI commands: `sudo birthday --wish`, `cat note.txt`, `whoami`, `help`, `clear`.

12. **Cinematic Contrast & Sincere Finale**:
    - Transitions from playful to heartfelt with the pre-final pause, multi-step message compilation, and replay button.

---

## 🛠️ Customization Guide

All personal information, photo captions, messages, and settings are located in one file:
👉 **[`data/birthday.ts`](./data/birthday.ts)**

- **Real Photos**: Drop 5 images into `public/photos/` (`photo1.jpg` to `photo5.jpg`).
- **Music**: Place your song in `public/music/` (e.g. `public/music/song.mp3`).
- **Message**: Edit `message.content` in [`data/birthday.ts`](./data/birthday.ts).
- **Memories & Qualities**: Edit `timeline` and `qualities` arrays.
- **Choices & Copy**: Everything is editable directly in [`data/birthday.ts`](./data/birthday.ts).

---

## 🚢 Deploying to Vercel

```bash
# Push to GitHub
git add .
git commit -m "feat: complete interactive birthday experience"
git push origin main
```
Import the repository on [Vercel](https://vercel.com) and deploy with standard Next.js settings!

---

*Designed & developed by Anuj for Anshika • 19th Birthday • 28 October 2026*
