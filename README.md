# ✨ Anshika's 19th Birthday Website (`ANSHIKA.EXE`)

A personal, modern, CS-themed interactive birthday website built by **Anuj** for **Anshika** on her 19th birthday (28 October 2026).

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

## 🛠️ How to Customize Everything

All personal details, messages, timeline events, and qualities are stored inside a single configuration file:
👉 **[`data/birthday.ts`](./data/birthday.ts)**

You do **not** need to touch any React component code to customize the site!

---

### 1. 📸 Adding Her Real Photos

1. Place your 5 favorite photos of Anshika (or moments together) into the `public/photos/` directory:
   - `public/photos/photo1.jpg`
   - `public/photos/photo2.jpg`
   - `public/photos/photo3.jpg`
   - `public/photos/photo4.jpg`
   - `public/photos/photo5.jpg`
   *(Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`)*

2. Open [`data/birthday.ts`](./data/birthday.ts) and edit the captions and tags in the `photos` array:
   ```ts
   photos: [
     {
       id: 1,
       src: "/photos/photo1.jpg",
       caption: "Your favorite memory or moment caption here",
       tag: "Memory 01",
       rotation: -3, // Tilt angle in degrees for the polaroid effect
     },
     // ...
   ]
   ```

---

### 2. 🎵 Adding / Changing the Music

1. Add your chosen song file (e.g. `birthday-song.mp3`) into the `public/music/` directory.
2. Open [`data/birthday.ts`](./data/birthday.ts) and update the `music` section:
   ```ts
   music: {
     title: "Song Name",
     artist: "Artist Name",
     src: "/music/birthday-song.mp3", // Or any public URL
   }
   ```
> **Note**: Even if no MP3 file is provided, the website includes a built-in ambient Web Audio chord synthesizer so music plays smoothly out of the box! Audio strictly plays **only after** the user clicks `[ ENTER EXPERIENCE ]` to comply with browser autoplay policies.

---

### 3. ✍️ Editing the Birthday Message

Open [`data/birthday.ts`](./data/birthday.ts) and edit the `message` section:
```ts
message: {
  title: "A little message",
  codeComment: "// personal_note.ts (Compiled with care)",
  content: [
    "Happy Birthday, Anshika.",
    "I could have just sent you a normal birthday message, but where's the fun in that when we're both CS students?",
    "So I decided to build something instead.",
    "I hope this year brings you a lot of good memories, good people, good opportunities, and plenty of reasons to smile.",
    "Have an amazing 19th.",
  ],
}
```
Add or change any lines you want. Each line appears in the code editor window with subtle syntax highlighting.

---

### 4. 🗓️ Editing Memories & Timeline

Open [`data/birthday.ts`](./data/birthday.ts) and edit the `timeline` array:
```ts
timeline: [
  {
    id: "mem-01",
    step: "01",
    title: "First time we met / Lab session",
    date: "Semester 01",
    description: "Write what happened during this memory...",
    photo: "/photos/photo1.jpg", // Optional photo preview
  },
  // Add more entries as needed!
]
```

---

### 5. 💡 Editing "Things that make you, you" (Qualities)

Open [`data/birthday.ts`](./data/birthday.ts) and update the `qualities` array:
```ts
qualities: [
  {
    id: 1,
    icon: "Sparkles", // Lucide icon: Sparkles, Code2, Coffee, Smile, HeartHandshake, Compass
    title: "Genuine Vibe",
    description: "Your description here...",
    tag: "Trait 01",
  },
  // ...
]
```

---

### 6. 🕵️‍♂️ Hidden Easter Egg

- Clicking the `dev.sh` terminal icon in the top navigation bar **5 times** reveals the secret developer terminal.
- The default command is:
  ```bash
  sudo birthday --wish
  ```
- Output:
  ```text
  "May your code compile on the first try."
  ```
- You can customize this command and response in [`data/birthday.ts`](./data/birthday.ts) under `easterEgg`.
- Other interactive commands built-in: `help`, `cat note.txt`, `whoami`, `clear`, `exit`.

---

## 🚢 Deploying to Vercel (Production Ready)

This repository is pre-configured and 100% ready for one-click deployment on [Vercel](https://vercel.com).

### Method A: Deploy via GitHub (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete Anshika's 19th birthday website"
   git branch -M main
   git remote add origin https://github.com/your-username/anshika-19.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** -> **"Project"**.
4. Import your `anshika-19` repository.
5. Keep default settings (`Framework Preset: Next.js`) and click **"Deploy"**.
6. Vercel will give you a live production link (e.g. `https://anshika-19.vercel.app`) to share with her!

### Method B: Deploy via Vercel CLI
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy directly from terminal
vercel
```

---

## 💻 Tech Stack Summary

- **Next.js 16 (App Router)** + **React 19**
- **TypeScript** for strict type safety
- **Tailwind CSS v4** for modern glassmorphism and responsive design
- **Framer Motion** for smooth cinematic transitions and scroll triggers
- **Canvas-Confetti** for lightweight celebratory confetti bursts
- **HTML5 Audio + Web Audio API** dual-engine music player
- **Lucide React** for modern developer and system iconography

---

*Designed & developed by Anuj for Anshika • 19th Birthday • 28 October 2026*
